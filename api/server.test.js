const server = require("./server");
const request = require("supertest");
const db = require("../data/dbConfig");

test('sanity', () => {
  expect(true).toBe(true)
})

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
beforeEach(async () => {
  await db("users").truncate();
});
afterAll(async () => {
  await db.destroy();
});

it('knows process.env.NODE_ENV to be in "testing" mode', () => {
  expect(process.env.NODE_ENV).toBe("testing");
});

describe("Auth Endpoints", () => {
  describe("[POST] /api/auth/register", () => {
    it("(1) creates a new user in database", async () => {
      const res = await request(server).post("/api/auth/register").send({
        username: "test",
        password: "1234",
      });
      expect(res.body).toMatchObject({ id: 1, username: "test" });
    });

    it("(2) responds with proper message if username is taken", async () => {
      const user1 = await request(server).post("/api/auth/register").send({
        username: "test",
        password: "1234",
      });
      expect(user1.body).toMatchObject({ id: 1, username: "test" });
      const user2 = await request(server).post("/api/auth/register").send({
        username: "test",
        password: "1234",
      });
      expect(user2.body.message).toMatch(/username taken/);
    });
  });

  describe("[POST] /api/auth/login", () => {
    let res;

    beforeEach(async () => {
      await request(server).post("/api/auth/register").send({
        username: "test",
        password: "1234",
      });
    });

    it("(1) logs in with correct user greeting", async () => {
      res = await request(server).post("/api/auth/login").send({
        username: "test",
        password: "1234",
      });
      expect(res.body.message).toMatch(/welcome, test/);
    });

    it("(2) returns correct error message if credentials[username] are incorrect", async () => {
      res = await request(server).post("/api/auth/login").send({
        username: "foo",
        password: "1234",
      });
      expect(res.body.message).toMatch(/invalid credentials/);
    });
  });


});