import { useRouter } from "next/router";
import { tokenService } from "../src/services/auth/tokenService";
import { useEffect } from "react";
import { HttpClient } from "../src/infra/HttpClient/HttpClient";

export default function LogoutPage() {
  const router = useRouter();
  useEffect(async () => {
    try {
      await HttpClient("/api/refresh", {
        method: "DELETE",
      });
      tokenService.delete();
      router.push("/");
    } catch (err) {
      alert(err.message);
    }
  }, []);

  return <div>Você será direcionado em instantes ...</div>;
}
