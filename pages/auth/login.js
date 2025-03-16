import { signIn } from "next-auth/react";

export default function LoginPage() {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center vh-100">
            <h1 className="text-primary mb-4">Welcome Bataty</h1>
            <button className="btn btn-lg btn-primary" onClick={() => signIn("google", { callbackUrl: "/" })}>
                Login
            </button>
        </div>
    );
}
