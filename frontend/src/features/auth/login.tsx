"use client";
import { ArrowRight, GitBranch } from "@phosphor-icons/react";
import { useState, type FormEvent } from "react";
import { CrmWorkflow } from "@/components/illustrations/crm-workflow";
import { Brand } from "@/components/ui/brand";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "./store";

export function Login() {
  const signIn = useAuth((state) => state.signIn);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim()) signIn({ name: name.trim(), email: email.trim() });
  }
  return (
    <main className="login-page">
      <section className="login-story">
        <Brand />
        <div className="login-story-body">
          <span className="eyebrow">
            SMALL DETAILS. STRONGER RELATIONSHIPS.
          </span>
          <h1>
            Good relationships
            <br />
            start with <br />
            <span>showing up.</span>
          </h1>
          <p>
            A clear view of every lead, every conversation, and what comes next.
          </p>
          <CrmWorkflow />
        </div>
        <p className="login-caption">
          Less busywork. More meaningful conversations.
        </p>
      </section>
      <section className="login-form-side">
        <div className="login-theme">
          <ThemeToggle />
        </div>
        <div className="login-form-wrap">
          <span className="demo-label">
            <span className="live-dot" />
            DEMO WORKSPACE
          </span>
          <h2>Make yourself at home.</h2>
          <p>Tell us what to call you. Your leads are waiting.</p>
          <form className="login-form" onSubmit={submit}>
            <label>
              Your name
              <input
                required
                maxLength={80}
                autoComplete="name"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(event) => setName(event.target.value)}
                pattern=".*\S.*"
              />
            </label>
            <label>
              Email address
              <input
                required
                type="email"
                maxLength={254}
                autoComplete="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <button className="button primary login-submit" type="submit">
              Enter workspace
              <ArrowRight size={19} />
            </button>
          </form>
          <div className="demo-note">
            <GitBranch size={18} />
            <p>
              This is a demo sign-in. No password is needed.
              <br />
              Your session stays in this browser tab.
            </p>
          </div>
        </div>
        <div className="login-footer">
          <span>LeadFlow · Built for the follow-through.</span>
          <span>v1.0</span>
        </div>
      </section>
    </main>
  );
}
