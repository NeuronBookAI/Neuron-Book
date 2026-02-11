import { defineField, defineType } from "sanity";
import { User } from "lucide-react";

export const userType = defineType({
  name: "user",
  title: "User Profile",
  type: "document",
  icon: User,
  fields: [
    defineField({
      name: "username",
      title: "User Name",
      type: "string",
    }),

    defineField({
      name: "userId",
      title: "User ID",
      type: "string",
      hidden: true,
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "ownedTextbooks",
      title: "My Library",
      type: "array",
      of: [{ type: "reference", to: [{ type: "textbook" }] }],
    }),
  ],
});
