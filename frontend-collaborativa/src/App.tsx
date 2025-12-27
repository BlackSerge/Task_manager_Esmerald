import { RouterProvider } from "react-router-dom";
import Providers from "@/app/providers";
import { appRouter } from "@/app/router";

export default function App() {
  return (
    <Providers> 
      {/* El RouterProvider cuenta como 'child', así Providers no está vacío */}
      <RouterProvider router={appRouter} />
    </Providers>
  );
}