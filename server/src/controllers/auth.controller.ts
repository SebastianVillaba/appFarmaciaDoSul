import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { executeRequest, sql } from "../utils/dbHandler";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Nombre de usuario y contraseña son obligatorios!" });
    return;
  }

  try {
    const result = await executeRequest({
      query: "sp_usuarioPassPacote",
      isStoredProcedure: true,
      inputs: [
        {
          name: 'usuario',
          type: sql.VarChar(20),
          value: username
        },
        {
          name: 'pass',
          type: sql.VarChar(20),
          value: password
        }
      ]
    });

    const { resultado, idUsuario } = result.recordset[0];

    if (resultado === 1) {
      res.status(401).json({ message: "Usuario no encontrado" });
      return;
    } else if (resultado === 2) {
      res.status(401).json({ message: "Contraseña incorrecta" });
      return;
    } else if (resultado === 3) {

      const resultFinal = {
        ...result.recordset[0],
      }

      const token = jwt.sign(
        resultFinal,
        process.env.JWT_SECRET || "andate a la puta",
        { expiresIn: "30m" }
      );



      res.json({
        message: "Login exitoso",
        token,
        user: {
          id: idUsuario,
          idSucursal: resultFinal.idSucursal
        },
        success: true
      });
    } else {
      res.status(500).json({ message: "Error desconocido en autenticación" });
    }
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};