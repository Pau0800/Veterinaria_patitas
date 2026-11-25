"use client";

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Dog, Cat, Bird, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

function getSpeciesIcon(species = "") {
  const normalized = String(species).toLowerCase().trim();
  if (normalized === "perro" || normalized === "canino") return Dog;
  if (normalized === "gato" || normalized === "felino") return Cat;
  if (normalized === "ave" || normalized === "pájaro") return Bird;
  return PawPrint;
}

const SIZE_CLASSES = {
  xs: "w-7 h-7 rounded-lg",
  sm: "w-9 h-9 rounded-xl",
  md: "w-11 h-11 rounded-xl",
  lg: "w-16 h-16 rounded-2xl",
};

const ICON_SIZE_CLASSES = {
  xs: "w-3.5 h-3.5",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-7 h-7",
};

export function PetAvatar({
  src,
  name = "Mascota",
  species = "",
  size = "sm",
  className = "",
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const Icon = getSpeciesIcon(species);
  const validSrc = typeof src === "string" && src.trim() ? src.trim() : null;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-autumn-100 border border-autumn-200 flex items-center justify-center text-autumn-600",
        SIZE_CLASSES[size] || SIZE_CLASSES.sm,
        className
      )}
    >
      {validSrc && !hasError ? (
        <img
          src={validSrc}
          alt={`Foto de ${name}`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <Icon
          className={cn("opacity-75", ICON_SIZE_CLASSES[size] || ICON_SIZE_CLASSES.sm)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

PetAvatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
  species: PropTypes.string,
  size: PropTypes.oneOf(["xs", "sm", "md", "lg"]),
  className: PropTypes.string,
};
