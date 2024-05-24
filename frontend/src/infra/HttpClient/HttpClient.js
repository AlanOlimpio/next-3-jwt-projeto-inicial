import nookies from "nookies";
import { REFRESH_TOKEN_NAME } from "../../../pages/api/refresh";
import { tokenService } from "../../services/auth/tokenService";

export async function HttpClient(fetchUrl, fetchOptions = {}) {
  const defaultHeaders = fetchOptions.headers || {};
  return fetch(fetchUrl, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...defaultHeaders,
    },
    body: fetchOptions.body ? JSON.stringify(fetchOptions.body) : null,
  })
    .then(async (response) => {
      return {
        ok: response.ok,
        status: response.status,
        status: response.status,
        body: await response.json(),
      };
    })
    .then(async (response) => {
      if (!fetchOptions.refresh) return response;
      if (response.status !== 401) return response;
      const isServer = Boolean(fetchOptions?.ctx);
      const currentRefreshToken =
        fetchOptions?.ctx?.req?.cookies[REFRESH_TOKEN_NAME];
      console.log("currentRefreshToken", currentRefreshToken);
      const refreshResponse = await HttpClient("/api/refresh", {
        method: isServer ? "PUT" : "GET",
        body: isServer ? { refresh_token: currentRefreshToken } : undefined,
      });

      // [Tentar atualizar os tokens]

      try {
        const newAccessToken = refreshResponse.body.data.access_token;
        const newRefreshToken = refreshResponse.body.data.refresh_token;

        // [Gurda os tokens]
        if (isServer) {
          nookies.set(fetchOptions.ctx, REFRESH_TOKEN_NAME, newRefreshToken, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
          });
        }

        tokenService.save(newAccessToken);
        const retryResponse = await HttpClient(fetchUrl, {
          ...fetchOptions,
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
          },
          refresh: false,
        });
        return retryResponse;
      } catch (err) {
        console.error(err);
        return response;
      }
    });
}
