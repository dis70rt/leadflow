"use client";
import { ArrowRight, SpinnerGap, UserPlus } from "@phosphor-icons/react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { errorMessage } from "@/lib/http";
import { useWorkspace } from "@/features/workspace/store";
import { useCreateLead } from "../queries";

export function AddLeadDialog() {
  const open = useWorkspace((state) => state.addLeadOpen);
  const setOpen = useWorkspace((state) => state.setAddLeadOpen);
  return open ? <AddLeadForm onClose={() => setOpen(false)} /> : null;
}
function AddLeadForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const create = useCreateLead();
  const dirty = Boolean(name || company || phone);
  function close() {
    if (
      !create.isPending &&
      (!dirty || window.confirm("Discard this new lead?"))
    )
      onClose();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      await create.mutateAsync({
        name: name.trim(),
        company: company.trim() || null,
        phone: phone.trim() || null,
      });
      toast.success(`${name.trim()} added to your leads`);
      useWorkspace.getState().setSearch("");
      useWorkspace.getState().setStatus("all");
      onClose();
    } catch {
      /* Mutation error is rendered beside the form. */
    }
  }
  return (
    <Modal
      open
      onOpenChange={(value) => {
        if (!value) close();
      }}
      title="A new connection"
      description="Start with a name. You can build the relationship from here."
    >
      <form onSubmit={submit}>
        <div className="modal-form">
          <div className="form-callout">
            <UserPlus size={20} />
            <span>
              New leads start at <strong>New</strong>.
            </span>
          </div>
          <label>
            Full name <span className="required">*</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Jamie Chen"
              required
              maxLength={200}
              pattern=".*\S.*"
              autoComplete="name"
              disabled={create.isPending}
            />
          </label>
          <label>
            Company <span className="optional">Optional</span>
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="e.g. Northstar Studio"
              maxLength={200}
              autoComplete="organization"
              disabled={create.isPending}
            />
          </label>
          <label>
            Phone <span className="optional">Optional</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="e.g. +91 98765 43210"
              maxLength={40}
              autoComplete="tel"
              type="tel"
              disabled={create.isPending}
            />
          </label>
          {create.isError && (
            <p className="field-error" role="alert">
              {errorMessage(create.error)}
            </p>
          )}
        </div>
        <div className="modal-footer">
          <button
            className="button ghost"
            type="button"
            onClick={close}
            disabled={create.isPending}
          >
            Cancel
          </button>
          <button
            className="button primary"
            disabled={create.isPending}
            type="submit"
          >
            {create.isPending ? (
              <SpinnerGap className="spin" size={17} />
            ) : (
              <ArrowRight size={17} />
            )}
            {create.isPending ? "Adding lead…" : "Add lead"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
