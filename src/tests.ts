import { describe, expect, it, vi } from "vitest";
import { coercer } from ".";

describe("ofcoerce", () => {
  it("copies the object", () => {
    const coerce = createUserCoercer();
    const input = {
      name: "Sasha",
      email: "koss@nocorp.me",
    };
    const result = coerce(input);
    expect(result).not.toBe(input);
    expect(result).toEqual({
      name: "Sasha",
      email: "koss@nocorp.me",
    });
  });

  it("coerces to the defined schema", () => {
    const coerce = createUserCoercer();
    const result = coerce({ name: "Sasha" });
    expect(result).toEqual({
      name: "Sasha",
      email: "",
    });
  });

  it("allows to pass schema directly", () => {
    const coerce = createProjectCoercer();
    const result = coerce({ name: "Mind Control" });
    expect(result).toEqual({
      slug: "",
      name: "Mind Control",
    });
  });

  it("coerces optional fields", () => {
    const coerce = createUserCoercer();
    const result = coerce({ age: "37" });
    expect(result).toEqual({
      name: "",
      email: "",
      age: 37,
    });
  });

  describe("primitives", () => {
    it("accepts undefined", () => {
      const coerce = createUserCoercer();
      const result = coerce(undefined);
      expect(result).toEqual({
        name: "",
        email: "",
      });
    });

    it("accepts null", () => {
      const coerce = createUserCoercer();
      const result = coerce(null);
      expect(result).toEqual({
        name: "",
        email: "",
      });
    });
  });

  describe("objects", () => {
    it("supports nested objects", () => {
      const coerce = createOrderCoercer();
      const result = coerce({});
      expect(result).toEqual({
        amount: 0,
        address: {
          street: "",
          city: "",
        },
        paid: false,
      });
    });
  });

  describe("arrays", () => {
    it("supports arrays", () => {
      const coerce = createSongCoercer();
      const result = coerce({
        title: "Mind Control",
        lyrics: {
          lines: ["Hello", undefined],
        },
      });
      expect(result).toEqual({
        title: "Mind Control",
        artist: "",
        lyrics: {
          lines: ["Hello", ""],
        },
      });
    });

    it("coerces missing arrays", () => {
      const coerce = createSongCoercer();
      const result = coerce(null);
      expect(result).toEqual({
        title: "",
        artist: "",
        lyrics: {
          lines: [],
        },
      });
    });
  });

  describe("iterators", () => {
    it("supports FormData", () => {
      const coerce = createUserCoercer();
      const formData = new FormData();
      formData.append("name", "Sasha");
      formData.append("email", "koss@nocorp.me");
      const result = coerce(formData);
      expect(result).toEqual({
        name: "Sasha",
        email: "koss@nocorp.me",
      });
    });
  });

  describe("infer", () => {
    it("refers to the coercer function", () => {
      expect(coercer.infer).toBe(coercer);
    });
  });
});

interface User {
  name: string;
  email: string;
  age?: number;
}

function createUserCoercer() {
  return coercer<User>(($) => ({
    name: String,
    email: String,
    age: $.Optional(Number),
  }));
}

interface Project {
  slug: string;
  name: string;
}

function createProjectCoercer() {
  return coercer<Project>({
    slug: String,
    name: String,
  });
}

interface Address {
  street: string;
  city: string;
}

interface Order {
  amount: number;
  address: Address;
  paid: boolean;
}

function createOrderCoercer() {
  return coercer<Order>(($) => ({
    amount: Number,
    address: {
      street: String,
      city: String,
    },
    paid: Boolean,
  }));
}

interface Lyrics {
  author?: string;
  lines: string[];
}

interface Song {
  title: string;
  lyrics: Lyrics;
  artist: string;
}

function createSongCoercer() {
  return coercer<Song>(($) => ({
    title: String,
    artist: String,
    lyrics: {
      author: $.Optional(String),
      lines: Array(String),
    },
  }));
}
