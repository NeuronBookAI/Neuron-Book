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
      validation: (Rule) => Rule.custom((value, ctx) => {
        // user is required unless this is demo content
        const isDemo = (ctx.document as { isDemo?: boolean })?.isDemo;
        if (!isDemo && !value) return "Owner is required for non-demo textbooks";
        return true;
      }),
    }),
    defineField({
      name: "isDemo",
      title: "Demo Content",
      description: "If true, this textbook is visible to all users as example content.",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
