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

  it("has infer alias", () => {
    expect(coercer.infer).toBe(coercer);
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

  describe("literals", () => {
    it("coerces string literals", () => {
      const coerce = coercer.infer({
        type: "user",
        name: String,
      });
      expect(coerce({ name: "Sasha" })).toEqual({
        type: "user",
        name: "Sasha",
      });
      expect(coerce({ type: "Sasha" })).toEqual({
        type: "user",
        name: "",
      });
      expect(coerce({ type: false })).toEqual({
        type: "user",
        name: "",
      });
    });

    it("coerces number literals", () => {
      const coerce = coercer.infer({
        magic: 42,
      });
      expect(coerce(null)).toEqual({
        magic: 42,
      });
      expect(coerce({ magic: "33" })).toEqual({
        magic: 42,
      });
      expect(coerce({ magic: false })).toEqual({
        magic: 42,
      });
    });

    it("coerces boolean literals", () => {
      const coerce = coercer.infer({
        flag: true,
      });
      expect(coerce(null)).toEqual({
        flag: true,
      });
      expect(coerce({ flag: false })).toEqual({
        flag: true,
      });
      expect(coerce({ flag: 42 })).toEqual({
        flag: true,
      });
    });

    it("coerces null literals", () => {
      const coerce = coercer.infer({
        nope: null,
      });
      expect(coerce(null)).toEqual({
        nope: null,
      });
      expect(coerce({ nope: "nah" })).toEqual({
        nope: null,
      });
      expect(coerce({ nope: 0 })).toEqual({
        nope: null,
      });
    });

    it("coerces undefined literals", () => {
      const coerce = coercer.infer({
        nope: undefined,
      });
      expect(coerce(null)).toEqual({
        nope: undefined,
      });
      expect(coerce({ nope: "nah" })).toEqual({
        nope: undefined,
      });
      expect(coerce({ nope: 0 })).toEqual({
        nope: undefined,
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
      lines: $.Array(String),
    },
  }));
}
