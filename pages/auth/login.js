import { signIn } from "next-auth/react";
import Head from "next/head";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login | bliss</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Urbanist:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        className="d-flex justify-content-center align-items-center vh-100 bg-light"
        style={{ fontFamily: "Urbanist, sans-serif" }}
      >
        <div
          className="bg-white p-5 rounded shadow-sm text-center"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          <h2
            className="mb-4"
            style={{
              fontWeight: 700,
              color: "#1e3a8a",
              textTransform: "lowercase",
              letterSpacing: "0.5px",
            }}
          >
            bliss
          </h2>

          <p className="text-muted small mb-4">welcome to your financial workspace</p>

          <button
            className="btn btn-primary rounded-pill px-4 py-2 fw-semibold"
            style={{
              backgroundColor: "#1e3a8a",
              borderColor: "#1e3a8a",
              textTransform: "lowercase",
            }}
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            log in with google
          </button>
        </div>
      </div>
    </>
  );
}
