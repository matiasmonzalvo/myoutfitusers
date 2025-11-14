import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Pricing() {
  return (
    <section className="flex justify-center border-b border-border">
      <div className="mx-auto w-6xl border-x border-border">
        <div className="text-center py-24 border-b border-border">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Flexible Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Start for free, then scale as you grow
          </p>
        </div>

        <div className="grid divide-x divide-border md:grid-cols-2">
          <div className="relative p-4">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground">Gratis</h3>
              <p className="text-muted-foreground">Perfecto para empezar</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground">/mes</span>
            </div>
            <ul className="mb-8 space-y-3">
              <li className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4 text-primary" />
                Hasta 3 tablas
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4 text-primary" />
                Fórmulas básicas
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4 text-primary" />
                1GB de almacenamiento
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4 text-primary" />
                Soporte por email
              </li>
            </ul>
            <button className="w-full bg-foreground text-background font-semibold rounded-lg p-2">
              <Link href="/register">Comenzar gratis</Link>
            </button>
          </div>

          <div className="relative border-primary p-8">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Más popular
              </span>
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground">Pro</h3>
              <p className="text-muted-foreground">
                Para equipos profesionales
              </p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-foreground">$12</span>
              <span className="text-muted-foreground">/mes</span>
            </div>
            <ul className="mb-8 space-y-3">
              <li className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4 text-primary" />
                Tablas ilimitadas
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4 text-primary" />
                Fórmulas avanzadas
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4 text-primary" />
                10GB de almacenamiento
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4 text-primary" />
                Colaboración en tiempo real
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4 text-primary" />
                Soporte prioritario
              </li>
            </ul>
            <button className="w-full">
              <Link href="/register">Comenzar prueba gratis</Link>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
