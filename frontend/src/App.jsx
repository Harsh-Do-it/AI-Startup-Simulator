import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "4px",
            background: "#14231c", // Ink Navy
            color: "#fdf9f2", // Ledger Ivory
            border: "1px solid #B08D4A", // Aged Brass
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
          },
        }}
      />
    </>
  );
}

export default App;
