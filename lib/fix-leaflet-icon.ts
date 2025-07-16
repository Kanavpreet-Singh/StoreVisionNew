// lib/fix-leaflet-icon.ts
export const fixLeafletIcons = () => {
  if (typeof window === "undefined") return; // Prevent SSR issues

  // Dynamic import only in browser
  Promise.all([
    import("leaflet"),
    import("leaflet/dist/images/marker-icon.png"),
    import("leaflet/dist/images/marker-icon-2x.png"),
    import("leaflet/dist/images/marker-shadow.png"),
  ]).then(([L, iconUrl, iconRetinaUrl, shadowUrl]) => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: iconRetinaUrl.default,
      iconUrl: iconUrl.default,
      shadowUrl: shadowUrl.default,
    });
  });
};
