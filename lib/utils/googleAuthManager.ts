/**
 * Google Authentication Manager
 *
 * Maneja la autenticación y renovación de tokens de Google OAuth2
 * para evitar errores 403 por tokens expirados.
 * Soporta múltiples servicios de Google (Drive, Calendar, etc.)
 */

const GSI_SRC = "https://accounts.google.com/gsi/client";

interface TokenData {
  accessToken: string;
  expiresAt: number; // timestamp en milisegundos
}

type GoogleService = "drive" | "calendar";

// Helper para cargar el script de Google Identity Services
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`No se pudo cargar script ${src}`));
    document.body.appendChild(script);
  });
}

class GoogleAuthManager {
  private static instance: GoogleAuthManager;
  private tokens: Map<GoogleService, TokenData> = new Map();

  // Margen de seguridad: renovar 5 minutos antes de que expire
  private readonly EXPIRY_BUFFER_MS = 5 * 60 * 1000;

  private readonly SERVICE_CONFIG = {
    drive: {
      storageKey: "googleDriveAccessToken",
      expiresKey: "googleDriveTokenExpiresAt",
      scope: "https://www.googleapis.com/auth/drive.file",
    },
    calendar: {
      storageKey: "googleCalendarAccessToken",
      expiresKey: "googleCalendarTokenExpiresAt",
      scope: "https://www.googleapis.com/auth/calendar.readonly",
    },
  };

  private constructor() {
    this.loadAllTokensFromStorage();
  }

  static getInstance(): GoogleAuthManager {
    if (!GoogleAuthManager.instance) {
      GoogleAuthManager.instance = new GoogleAuthManager();
    }
    return GoogleAuthManager.instance;
  }

  /**
   * Carga todos los tokens desde localStorage
   */
  private loadAllTokensFromStorage(): void {
    Object.entries(this.SERVICE_CONFIG).forEach(([service, config]) => {
      this.loadTokenFromStorage(service as GoogleService);
    });
  }

  /**
   * Carga el token de un servicio desde localStorage
   */
  private loadTokenFromStorage(service: GoogleService): void {
    if (typeof window === "undefined") return;

    const config = this.SERVICE_CONFIG[service];
    if (!config) return;

    try {
      const token = window.localStorage.getItem(config.storageKey);
      const expiresAt = window.localStorage.getItem(config.expiresKey);

      if (token && expiresAt) {
        this.tokens.set(service, {
          accessToken: token,
          expiresAt: parseInt(expiresAt, 10),
        });
      }
    } catch (error) {
      console.error(
        `[GoogleAuthManager] Error cargando token de ${service}:`,
        error
      );
      this.clearToken(service);
    }
  }

  /**
   * Guarda el token de un servicio en localStorage
   */
  private saveTokenToStorage(
    service: GoogleService,
    token: string,
    expiresInSeconds: number
  ): void {
    if (typeof window === "undefined") return;

    const config = this.SERVICE_CONFIG[service];
    if (!config) return;

    try {
      const expiresAt = Date.now() + expiresInSeconds * 1000;

      window.localStorage.setItem(config.storageKey, token);
      window.localStorage.setItem(config.expiresKey, expiresAt.toString());

      this.tokens.set(service, {
        accessToken: token,
        expiresAt,
      });
    } catch (error) {
      console.error(
        `[GoogleAuthManager] Error guardando token de ${service}:`,
        error
      );
    }
  }

  /**
   * Limpia el token de un servicio del storage
   */
  private clearToken(service: GoogleService): void {
    if (typeof window === "undefined") return;

    const config = this.SERVICE_CONFIG[service];
    if (!config) return;

    try {
      window.localStorage.removeItem(config.storageKey);
      window.localStorage.removeItem(config.expiresKey);
      this.tokens.delete(service);
    } catch (error) {
      console.error(
        `[GoogleAuthManager] Error limpiando token de ${service}:`,
        error
      );
    }
  }

  /**
   * Verifica si el token de un servicio es válido (no expirado)
   */
  private isTokenValid(service: GoogleService): boolean {
    const tokenData = this.tokens.get(service);
    if (!tokenData) return false;

    // Considerar token inválido si va a expirar en los próximos 5 minutos
    return Date.now() < tokenData.expiresAt - this.EXPIRY_BUFFER_MS;
  }

  /**
   * Solicita un nuevo token de acceso a Google
   */
  private async requestNewToken(
    clientId: string,
    scope: string
  ): Promise<{ token: string; expiresIn: number }> {
    if (typeof window === "undefined") {
      throw new Error("requestNewToken solo puede ejecutarse en el navegador");
    }

    await loadScript(GSI_SRC);

    return new Promise((resolve, reject) => {
      try {
        // @ts-expect-error google global
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope,
          callback: (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }

            if (response.access_token) {
              // Por defecto, Google tokens expiran en 3600 segundos (1 hora)
              const expiresIn = response.expires_in || 3600;
              resolve({
                token: response.access_token,
                expiresIn,
              });
            } else {
              reject(new Error("No se recibió access_token"));
            }
          },
        });

        // Importante: usar requestAccessToken con prompt='' para intentar
        // obtener un token silenciosamente si es posible
        tokenClient.requestAccessToken({ prompt: "" });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtiene un token de acceso válido para un servicio específico.
   * Si el token actual es válido, lo devuelve.
   * Si no, solicita uno nuevo.
   */
  async getValidToken(
    clientId: string,
    service: GoogleService = "drive"
  ): Promise<string> {
    if (!clientId) {
      throw new Error("clientId es requerido");
    }

    const config = this.SERVICE_CONFIG[service];
    if (!config) {
      throw new Error(`Servicio no soportado: ${service}`);
    }

    // Si ya tenemos un token válido, devolverlo
    if (this.isTokenValid(service)) {
      const tokenData = this.tokens.get(service);
      if (tokenData) {
        return tokenData.accessToken;
      }
    }

    // Si no, solicitar uno nuevo
    try {
      const { token, expiresIn } = await this.requestNewToken(
        clientId,
        config.scope
      );
      this.saveTokenToStorage(service, token, expiresIn);
      return token;
    } catch (error) {
      // Si falla, limpiar token anterior y propagar error
      this.clearToken(service);
      throw error;
    }
  }

  /**
   * Verifica si hay un token guardado para un servicio (sin validar si está expirado)
   */
  hasStoredToken(service: GoogleService = "drive"): boolean {
    return this.tokens.has(service);
  }

  /**
   * Fuerza la renovación del token de un servicio
   */
  async forceRefreshToken(
    clientId: string,
    service: GoogleService = "drive"
  ): Promise<string> {
    this.clearToken(service);
    return this.getValidToken(clientId, service);
  }

  /**
   * Desconecta (limpia el token) de un servicio o todos
   */
  disconnect(service?: GoogleService): void {
    if (service) {
      this.clearToken(service);
    } else {
      // Limpiar todos los servicios
      Object.keys(this.SERVICE_CONFIG).forEach((svc) => {
        this.clearToken(svc as GoogleService);
      });
    }
  }
}

export default GoogleAuthManager;

// Export singleton instance
export const googleAuthManager = GoogleAuthManager.getInstance();
