import { test, describe } from "node:test";
import assert from "node:assert/strict";
import UnboundSDK from "../index.js";
import { PortalProjectsService } from "../services/portalProjects.js";

function buildFakeSdk() {
  const calls = [];
  const fakeSdk = {
    validateParams(params, schema) {
      for (const key in schema) {
        if (params[key] === undefined && schema[key].required) {
          throw new Error(`Missing required parameter ${key}`);
        }
        if (params[key] !== undefined && params[key] !== null) {
          const expectedType = schema[key].type;
          const actualValue = params[key];
          const isValidType =
            expectedType === "array"
              ? Array.isArray(actualValue)
              : typeof actualValue === expectedType;
          if (!isValidType) {
            throw new Error(
              `Invalid type for parameter ${key}: expected ${expectedType}`,
            );
          }
        }
      }
    },
  };
  fakeSdk[Symbol.for("unbound.sdk.request")] = async (
    endpoint,
    method,
    params,
  ) => {
    calls.push({ endpoint, method, params });
    return { ok: true };
  };
  return { fakeSdk, calls };
}

describe("UnboundSDK.portalProjects", () => {
  test("is wired on the SDK instance with README methods", () => {
    const sdk = new UnboundSDK({ namespace: "t" });
    assert.ok(sdk.portalProjects);
    assert.equal(typeof sdk.portalProjects.list, "function");
    assert.equal(typeof sdk.portalProjects.get, "function");
    assert.equal(typeof sdk.portalProjects.listMembers, "function");
    assert.equal(typeof sdk.portalProjects.addMember, "function");
    assert.equal(typeof sdk.portalProjects.removeMember, "function");
    assert.equal(typeof sdk.portalProjects.getMeet, "function");
  });
});

describe("PortalProjectsService.list", () => {
  test("without args GETs /portal-projects", async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new PortalProjectsService(fakeSdk).list();
    assert.equal(calls[0].endpoint, "/portal-projects");
    assert.equal(calls[0].method, "GET");
    assert.deepEqual(calls[0].params, {
      query: { q: undefined, limit: undefined, offset: undefined },
    });
  });

  test("passes q, limit, offset as query params", async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new PortalProjectsService(fakeSdk).list({
      q: "onboard",
      limit: 10,
      offset: 20,
    });
    assert.equal(calls[0].endpoint, "/portal-projects");
    assert.equal(calls[0].method, "GET");
    assert.deepEqual(calls[0].params, {
      query: { q: "onboard", limit: 10, offset: 20 },
    });
  });

  test("rejects non-string q", async () => {
    const { fakeSdk } = buildFakeSdk();
    await assert.rejects(
      () => new PortalProjectsService(fakeSdk).list({ q: 1 }),
      /Invalid type for parameter q/,
    );
  });
});

describe("PortalProjectsService.get", () => {
  test("GETs /portal-projects/:id", async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new PortalProjectsService(fakeSdk).get("proj-1");
    assert.equal(calls[0].endpoint, "/portal-projects/proj-1");
    assert.equal(calls[0].method, "GET");
  });

  test("requires id", async () => {
    const { fakeSdk } = buildFakeSdk();
    await assert.rejects(
      () => new PortalProjectsService(fakeSdk).get(),
      /Missing required parameter id/,
    );
  });
});

describe("PortalProjectsService.listMembers", () => {
  test("GETs /portal-projects/:id/members", async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new PortalProjectsService(fakeSdk).listMembers("proj-1");
    assert.equal(calls[0].endpoint, "/portal-projects/proj-1/members");
    assert.equal(calls[0].method, "GET");
  });
});

describe("PortalProjectsService.addMember", () => {
  test("POSTs /portal-projects/:id/members with peopleId+role", async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new PortalProjectsService(fakeSdk).addMember("proj-1", {
      peopleId: "ppl-1",
      role: "contributor",
    });
    assert.equal(calls[0].endpoint, "/portal-projects/proj-1/members");
    assert.equal(calls[0].method, "POST");
    assert.deepEqual(calls[0].params.body, {
      peopleId: "ppl-1",
      role: "contributor",
    });
  });

  test("omits role when not provided", async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new PortalProjectsService(fakeSdk).addMember("proj-1", {
      peopleId: "ppl-1",
    });
    assert.deepEqual(calls[0].params.body, { peopleId: "ppl-1" });
  });

  test("requires peopleId", async () => {
    const { fakeSdk } = buildFakeSdk();
    await assert.rejects(
      () => new PortalProjectsService(fakeSdk).addMember("proj-1", {}),
      /Missing required parameter peopleId/,
    );
  });
});

describe("PortalProjectsService.removeMember", () => {
  test("DELETEs /portal-projects/:id/members/:memberId", async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new PortalProjectsService(fakeSdk).removeMember("proj-1", "mem-1");
    assert.equal(calls[0].endpoint, "/portal-projects/proj-1/members/mem-1");
    assert.equal(calls[0].method, "DELETE");
  });

  test("requires memberId", async () => {
    const { fakeSdk } = buildFakeSdk();
    await assert.rejects(
      () => new PortalProjectsService(fakeSdk).removeMember("proj-1"),
      /Missing required parameter memberId/,
    );
  });
});

describe("PortalProjectsService.getMeet", () => {
  test("GETs /portal-projects/:id/meet", async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new PortalProjectsService(fakeSdk).getMeet("proj-1");
    assert.equal(calls[0].endpoint, "/portal-projects/proj-1/meet");
    assert.equal(calls[0].method, "GET");
  });
});
