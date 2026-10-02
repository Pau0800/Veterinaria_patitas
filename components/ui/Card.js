import React from "react";
import { cn } from "@/lib/utils";

/**
 * Componente Contenedor Principal
 * Soporta variante de interacción mediante la prop `interactive`.
 */
export const Card = React.forwardRef(function Card(
  { children, className, interactive = false, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-autumn-200 bg-white text-autumn-900 shadow-autumn-sm overflow-hidden transition-all duration-200",
        interactive &&
          "hover:border-autumn-300 hover:shadow-autumn-md active:scale-[0.995] cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = "Card";

/**
 * Cabecera de la Tarjeta
 */
export const CardHeader = React.forwardRef(function CardHeader(
  { children, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 p-5 border-b border-autumn-100/80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
CardHeader.displayName = "CardHeader";

/**
 * Título de la Tarjeta
 * Permite cambiar la etiqueta HTML dinámica mediante la prop `as` (default "h3").
 */
export const CardTitle = React.forwardRef(function CardTitle(
  { children, className, as: Component = "h3", ...props },
  ref
) {
  return (
    <Component
      ref={ref}
      className={cn(
        "text-lg font-bold leading-none tracking-tight text-autumn-900",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});
CardTitle.displayName = "CardTitle";

/**
 * Descripción o Subtítulo
 */
export const CardDescription = React.forwardRef(function CardDescription(
  { children, className, ...props },
  ref
) {
  return (
    <p
      ref={ref}
      className={cn("text-xs leading-relaxed text-autumn-800/70", className)}
      {...props}
    >
      {children}
    </p>
  );
});
CardDescription.displayName = "CardDescription";

/**
 * Cuerpo principal de contenido
 */
export const CardContent = React.forwardRef(function CardContent(
  { children, className, ...props },
  ref
) {
  return (
    <div ref={ref} className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
});
CardContent.displayName = "CardContent";

/**
 * Pie de la Tarjeta
 */
export const CardFooter = React.forwardRef(function CardFooter(
  { children, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between p-4 bg-autumn-50/40 border-t border-autumn-100/80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
CardFooter.displayName = "CardFooter";

// Asignación de patrón de componente compuesto (Compound Pattern) para facilitar importaciones
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;