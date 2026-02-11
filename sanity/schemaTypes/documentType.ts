import { defineField, defineType } from "sanity";

export const documentType = defineType({
  name: "textbook",
  title: "Textbook",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "file",
      title: "PDF File",
      type: "file",
      options: { accept: ".pdf" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "folder",
      title: "Folder",
      type: "array",
      of: [{ type: "reference", to: [{ type: "folder" }] }],
      description: "Which category does this textbook belong to?",
    }),
    defineField({
      name: "neurons",
      title: "Neurons",
      description: "Individual concepts mapped from this textbook.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "neuron" }] }],
    }),
    defineField({
      name: "user",
      title: "Owner",
      type: "reference",
      to: [{ type: "user" }],
      validation: (Rule) => Rule.required(),
    }),
  ],
});
