import { defineField, defineType } from "sanity";

export const folderType = defineType({
  name: "folder",
  title: "Folder",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Folder Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "user",
      title: "Owner",
      type: "reference",
      to: [{ type: "user" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "parentFolder",
      title: "Parent Folder",
      description:
        "Leave empty if this is a top-level category (e.g., 'Biology').",
      type: "reference",
      to: [{ type: "folder" }],
    }),
    defineField({
      name: "documents",
      title: "Textbooks in this Folder",
      type: "array",
      of: [{ type: "reference", to: [{ type: "textbook" }] }],
    }),
  ],
});
