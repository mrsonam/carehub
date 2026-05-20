import { test } from "node:test";
import assert from "node:assert/strict";
import { profilePatchPayload } from "../lib/profile/constants.js";
import {
  patientProfileComplete,
  validateProfilePatch,
} from "../lib/profile/validate.js";

test("profilePatchPayload omits other-role fields", () => {
  const payload = profilePatchPayload("PATIENT", {
    name: "Alex",
    title: "MD",
    dateOfBirth: "1990-01-01",
  });
  assert.equal(payload.name, "Alex");
  assert.equal(payload.dateOfBirth, "1990-01-01");
  assert.equal("title" in payload, false);
});

test("doctor patch requires title and phone", () => {
  const bad = validateProfilePatch("DOCTOR", { name: "Dr. Pat", title: "", phone: "" });
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.phone);
  assert.ok(bad.errors.title);
});

test("doctor patch accepts valid payload", () => {
  const good = validateProfilePatch("DOCTOR", {
    name: "Dr. Pat Lee",
    phone: "0400000000",
    title: "General Practitioner",
    bio: "Clinic lead",
    specialty: "Family medicine",
    department: "Primary care",
  });
  assert.equal(good.ok, true);
  assert.equal(good.data.specialty, "Family medicine");
});

test("patient emergency contact requires both fields", () => {
  const bad = validateProfilePatch("PATIENT", {
    name: "Alex Patient",
    emergencyContactName: "Sam",
    emergencyContactPhone: "",
  });
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.emergencyContactPhone);
});

test("patient completion when address and dob present", () => {
  const good = validateProfilePatch("PATIENT", {
    name: "Alex Patient",
    dateOfBirth: "1990-06-15",
    addressLine1: "1 Main St",
    city: "Sydney",
    state: "NSW",
    postalCode: "2000",
  });
  assert.equal(good.ok, true);
  assert.ok(good.data.profileCompletedAt instanceof Date);
  assert.equal(patientProfileComplete(good.data), true);
});

test("patient rejects invalid gender and state", () => {
  const bad = validateProfilePatch("PATIENT", {
    name: "Alex",
    gender: "INVALID",
    state: "XX",
  });
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.gender);
  assert.ok(bad.errors.state);
});

test("patient accepts gender and AU state", () => {
  const good = validateProfilePatch("PATIENT", {
    name: "Alex Patient",
    gender: "FEMALE",
    state: "NSW",
    dateOfBirth: "1990-06-15",
    addressLine1: "1 Main St",
    city: "Sydney",
    postalCode: "2000",
  });
  assert.equal(good.ok, true);
  assert.equal(good.data.gender, "FEMALE");
  assert.equal(good.data.state, "NSW");
});

test("patient rejects future date of birth", () => {
  const future = new Date();
  future.setFullYear(future.getFullYear() + 1);
  const y = future.getFullYear();
  const m = String(future.getMonth() + 1).padStart(2, "0");
  const d = String(future.getDate()).padStart(2, "0");
  const bad = validateProfilePatch("PATIENT", {
    name: "Alex",
    dateOfBirth: `${y}-${m}-${d}`,
  });
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.dateOfBirth);
});
