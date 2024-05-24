import { HttpClient } from "../../infra/HttpClient/HttpClient";
import { tokenService } from "./tokenService";

export const authService = {
  async login({ username, password }) {
    return HttpClient(`${process.env.NEXT_PUBLIC_BACKEN_URL}/api/login`, {
      method: "POST",
      headers: {
        accept: "*/*",
      },
      body: { username, password },
    })
      .then(async (resonse) => {
        if (!resonse.ok) {
          throw new Error("Usuário ou senha inválidos!");
        }
        const body = resonse.body;
        tokenService.save(body.data.access_token);
        return body;
      })
      .then(async ({ data }) => {
        const { refresh_token } = data;
        HttpClient("/api/refresh", {
          method: "POST",
          body: {
            refresh_token,
          },
        });
      });
  },
  async getSession(ctx = null) {
    const token = tokenService.get(ctx);
    return HttpClient(`${process.env.NEXT_PUBLIC_BACKEN_URL}/api/session`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      refresh: true,
    }).then((response) => {
      if (!response.ok) throw new Error("Não autorizado");
      return response.body.data;
    });
  },
};
