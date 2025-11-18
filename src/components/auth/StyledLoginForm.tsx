"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast/ToastProvider";

const LoginSchema = z.object({
  usernameOrEmail: z.string().min(1, { message: "Usuario o email requerido" }),
  password: z.string().min(6, { message: "Contraseña muy corta" }),
});

type LoginValues = z.infer<typeof LoginSchema>;

const Form = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { push } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(LoginSchema) });

  async function onSubmit(values: LoginValues) {
    try {
      const payload = { ...values, device: typeof navigator !== 'undefined' ? navigator.userAgent : undefined };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        try {
          const json = await res.json();
          if (res.status === 401) {
            setErrorMessage("Contraseña incorrecta");
          } else if (json?.message) {
            setErrorMessage(String(json.message));
          } else {
            setErrorMessage("Error al iniciar sesión");
          }
        } catch {
          setErrorMessage("Error al iniciar sesión");
        }
        return;
      }

      setErrorMessage(null);
      push({ title: "Bienvenido", description: "Sesión iniciada correctamente" });
      router.push("/admin/dashboard");
    } catch {
      setErrorMessage("Error en el servidor");
    }
  }

  return (
    <StyledWrapper>
      <div className="container">
        <div className="left">
          <div className="left-image">
            <Image src="/images/ermotoshd.webp" alt="Ermotos" fill style={{objectFit: 'cover'}} priority />
          </div>
        </div>
        <div className="right">
          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            <div className="brand">
              <Image src="/images/ermotoshd.webp" alt="Ermotos" width={44} height={44} />
              <span className="brand-text">ERMOTOS</span>
            </div>
        <div className="flex-column">
          <label>Correo o usuario</label>
        </div>
        <div className="inputForm">
          <svg xmlns="http://www.w3.org/2000/svg" width={20} viewBox="0 0 32 32" height={20}>
            <g data-name="Layer 3" id="Layer_3">
              <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" />
            </g>
          </svg>
          <input {...register("usernameOrEmail")} placeholder="Ingresa tu correo o usuario" className="input" type="text" disabled={isSubmitting} />
        </div>
        {errors.usernameOrEmail && <p className="error">{errors.usernameOrEmail.message}</p>}
        <div className="flex-column">
          <label>Contraseña</label>
        </div>
        <div className="inputForm relative">
          <svg xmlns="http://www.w3.org/2000/svg" width={20} viewBox="-64 0 512 512" height={20}>
            <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
            <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
          </svg>
          <input {...register("password")} placeholder="Ingresa tu contraseña" className="input" type={showPassword ? 'text' : 'password'} disabled={isSubmitting} />
          <button
            type="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="toggle-pwd"
            onClick={() => setShowPassword((s) => !s)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="error">{errors.password.message}</p>}
        {errorMessage && <p className="error">{errorMessage}</p>}
        <button className="button-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
        <p className="p">¿No tienes una cuenta? <Link href="/register" className="span">Regístrate</Link></p>
        <p className="p line">O con</p>
        <div className="flex-row">
          <button className="btn google" type="button">
            <svg xmlSpace="preserve" viewBox="0 0 512 512" y="0px" x="0px" xmlnsXlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" id="Layer_1" width={20} version="1.1">
              <path d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256
      	c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456
      	C103.821,274.792,107.225,292.797,113.47,309.408z" style={{fill: '#FBBB00'}} />
              <path d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451
      	c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535
      	c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z" style={{fill: '#518EF8'}} />
              <path d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512
      	c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771
      	c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z" style={{fill: '#28B446'}} />
              <path d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012
      	c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0
      	C318.115,0,375.068,22.126,419.404,58.936z" style={{fill: '#F14336'}} />
            </svg>
            Continuar con Google</button>
        </div>
          </form>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  min-height: 100vh;
  position: relative;

  .container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    width: 100%;
    min-height: 100vh;
  }

  .left {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
  }

  .left-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  /* dark gradient overlay to increase contrast for the centered form */
  .left-image::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.55) 100%);
    pointer-events: none;
    z-index: 2;
  }

  .right {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: linear-gradient(180deg, #0f0f0f 0%, #111111 42%, #1a1a1a 70%);
    padding: 40px 48px 36px 40px;
    width: 480px;
    max-width: 90vw;
    border-radius: 16px;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    transition: transform 0.15s ease;
    box-shadow: 0 48px 120px rgba(0,0,0,0.72);
    border: 1px solid rgba(255,138,0,0.08);
    overflow: hidden;
    position: relative;
    z-index: 10;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .brand-text {
    color: #ff8a00;
    font-weight: 900;
    font-size: 22px;
    letter-spacing: 1.5px;
  }

  .form:hover {
    transform: translateY(-3px);
  }

  ::placeholder {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  .form button {
    align-self: flex-end;
  }

  .flex-column > label {
    color: #ff8a00;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.6px;
    text-transform: capitalize;
    margin-bottom: 6px;
  }

  .inputForm {
    border: 1px solid #e7e7e7;
    border-radius: 999px;
    height: 52px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    transition: 0.18s ease-in-out, box-shadow 0.18s ease-in-out;
    background-color: #ffffff;
    box-shadow: 0 6px 18px rgba(17,17,17,0.06);
  }

  .input {
    margin-left: 12px;
    border-radius: 999px;
    border: none;
    width: 100%;
    height: 100%;
    font-size: 15px;
    color: #222222;
    background: transparent;
    padding-right: 36px;
  }

  .input:focus {
    outline: none;
  }

  .inputForm:focus-within {
    border-color: #ff8a00;
    box-shadow: 0 10px 30px rgba(255,138,0,0.08);
  }

  .flex-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
  }

  .flex-row > div > label {
    font-size: 14px;
    color: white;
    font-weight: 400;
  }

  .span {
    font-size: 14px;
    margin-left: 5px;
    color: #ffffff;
    font-weight: 600;
    cursor: pointer;
  }

  .button-submit {
    display: block;
    padding: 14px 20px;
    text-align: center;
    letter-spacing: 0.6px;
    background: linear-gradient(90deg,#ff8a00,#ff6a00);
    transition: transform 0.12s ease, box-shadow 0.12s ease;
    border-radius: 12px;
    margin: 18px 0 8px 0;
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
    height: 48px;
    width: 100%;
    border: none;
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(255,106,0,0.14);
  }

  .button-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 40px rgba(255,106,0,0.18);
  }

  .button-submit:active {
    transform: scale(0.9);
  }

  .button-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error {
    color: #ff4444;
    font-size: 12px;
    margin-top: -6px;
    margin-bottom: 4px;
  }

  .p {
    text-align: center;
    color: #f2e9df;
    font-size: 13px;
    margin: 8px 0 6px 0;
  }

  .btn {
    margin-top: 10px;
    width: 100%;
    height: 48px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 600;
    border: 1px solid #e6e6e6;
    background-color: white;
    cursor: pointer;
    transition: 0.14s ease-in-out;
    padding: 0 14px;
  }

  .relative {
    position: relative;
  }

  .toggle-pwd {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666666;
    padding: 4px;
  }

  .toggle-pwd:focus {
    outline: 2px solid rgba(255,138,0,0.25);
    border-radius: 6px;
  }

  @media (max-width: 980px) {
    .form {
      width: 100%;
      max-width: 480px;
      padding: 32px 24px;
    }
  }

  @media (max-width: 480px) {
    .form {
      padding: 24px 20px;
      gap: 12px;
    }
    .brand-text {
      font-size: 18px;
    }
    /* Additional responsive tweaks */
    @media (min-width: 1400px) {
      .form {
        width: 520px;
        padding: 44px 56px 40px 44px;
        border-radius: 18px;
      }
      .left-image::after {
        background: linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0) 100%);
      }
    }
  
    @media (max-width: 768px) {
      /* Mobile / Android: same as desktop - full background with centered card */
      .left {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1;
      }
      .left-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .left-image::after {
        background: linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.55) 100%);
      }
      .container {
        align-items: center;
        justify-content: center;
        padding: 16px;
        min-height: 100vh;
      }
      .right {
        position: relative;
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 16px;
      }
      .form {
        width: 100%;
        max-width: 420px;
        box-shadow: 0 48px 120px rgba(0,0,0,0.72);
        padding: 40px 28px 36px 28px;
        gap: 18px;
        border-radius: 20px;
      }
      .inputForm {
        height: 54px;
        margin-bottom: 6px;
      }
      .button-submit {
        height: 54px;
        margin: 24px 0 12px 0;
      }
      .brand {
        margin-bottom: 18px;
      }
      .brand-text {
        font-size: 22px;
      }
      .flex-column > label {
        margin-bottom: 10px;
      }
      .flex-row {
        margin: 8px 0;
      }
    }
  }
`;

export default Form;
