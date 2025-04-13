import api from "./api";

// ✅ Definir correctamente la estructura de la autenticación
export interface AuthResponse {
  token: string;
  username: string;
  user_type: string;
  user_id: string;
}

// ✅ Función para almacenar la sesión en `sessionStorage`
export const setUserSession = (user: AuthResponse) => {
  if (!user || !user.token) {
    console.error("❌ Error: Token no recibido en setUserSession", user);
    return;
  }
  console.log("✅ Token guardado en sessionStorage:", user.token);
  sessionStorage.setItem("user", JSON.stringify(user));
};

// ✅ Función para recuperar la sesión del usuario desde `sessionStorage`
export const getUserSession = (): AuthResponse | null => {
  const session = sessionStorage.getItem("user");
  if (!session) {
    console.warn("⚠️ No hay sesión activa.");
    return null;
  }
  try {
    return JSON.parse(session) as AuthResponse;
  } catch (error) {
    console.error("❌ Error al analizar la sesión:", error);
    removeUserSession();
    return null;
  }
};

// ✅ Función para eliminar la sesión del usuario
export const removeUserSession = () => {
  sessionStorage.removeItem("user");
  console.log("🚪 Sesión eliminada.");
};

// ✅ Función para iniciar sesión
export const login = async (
  username: string,
  password: string,
  userType: string
): Promise<AuthResponse | null> => {
  try {
    console.log("📌 Enviando solicitud de inicio de sesión a: /auth/login");

    const response = await api.post<AuthResponse>("/auth/login", {
      username,
      password,
      user_type: userType,
    });

    if (!response.data || !response.data.token) {
      console.error(
        "❌ Error: La respuesta de autenticación no contiene token.",
        response.data
      );
      return null;
    }

    const { token, username: user, user_type, user_id } = response.data;

    console.log("✅ Token recibido:", token);

    setUserSession({ username: user, token, user_type, user_id });

    return response.data;
  } catch (error) {
    console.error("❌ Error al iniciar sesión:", error);
    return null;
  }
};

// ✅ Función para obtener el usuario autenticado
export const getAuthenticatedUser = async (): Promise<AuthResponse | null> => {
  try {
    const response = await api.get<AuthResponse>("/auth/me");
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener el usuario autenticado:", error);
    return null;
  }
};

/* 🔹 🔹 🔹 FUNCIONES PARA ADMINISTRADORES 🔹 🔹 🔹 */

// ✅ Función para almacenar la sesión del admin en `sessionStorage`
export const setAdminSession = (admin: AuthResponse) => {
  if (!admin || !admin.token || !admin.user_type || !admin.user_id) {
    console.error(
      "❌ Error: Datos de admin incompletos en setAdminSession",
      admin
    );
    return;
  }

  console.log("✅ Guardando sesión del admin correctamente:", admin);
  sessionStorage.setItem("admin", JSON.stringify(admin)); // ✅ Guarda la sesión
  sessionStorage.setItem("user_type", admin.user_type); // ✅ Guarda user_type para validaciones
};

// ✅ Función para recuperar la sesión del admin
export const getAdminSession = (): AuthResponse | null => {
  const session = sessionStorage.getItem("admin");
  if (!session) {
    console.warn("⚠️ No hay administrador conectado.");
    return null;
  }
  try {
    const admin = JSON.parse(session) as AuthResponse;

    if (!admin.user_id || admin.user_type !== "Admin") {
      console.warn("⚠️ Datos de admin incorrectos en la sesión:", admin);
      removeAdminSession();
      return null;
    }

    console.log("✅ Sesión admin recuperada correctamente:", admin);
    return admin;
  } catch (error) {
    console.error("❌ Error al analizar la sesión admin:", error);
    removeAdminSession();
    return null;
  }
};

// ✅ Función para eliminar la sesión del admin
export const removeAdminSession = () => {
  sessionStorage.removeItem("admin");
  console.log("🚪 Sesión del administrador eliminada.");
};

// ✅ Función para iniciar sesión como administrador
export const loginAdmin = async (
  username: string,
  password: string
): Promise<AuthResponse | null> => {
  try {
    console.log("📌 Enviando solicitud de login admin a: /admin/admin-login");

    const response = await api.post<AuthResponse>("/admin/admin-login", {
      username,
      password,
    });

    if (
      !response.data ||
      !response.data.token ||
      !response.data.username ||
      !response.data.user_id
    ) {
      console.error(
        "❌ Error: La respuesta admin no contiene todos los datos.",
        response.data
      );
      return null;
    }

    const { token, username: user, user_type, user_id } = response.data;

    console.log("✅ Token de admin recibido:", token);

    // ✅ Guardamos correctamente todos los datos del admin
    setAdminSession({ username: user, token, user_type, user_id });

    return response.data;
  } catch (error) {
    console.error("❌ Error en el login admin:", error);
    return null;
  }
};

// ✅ Función para cerrar sesión del administrador
export const logoutAdmin = () => {
  console.log("🔴 Cerrando sesión del administrador...");
  sessionStorage.removeItem("admin");
  sessionStorage.removeItem("user_type"); // ✅ Eliminamos el tipo de usuario
};
