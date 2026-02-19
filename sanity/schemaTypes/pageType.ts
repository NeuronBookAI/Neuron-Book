import { defineField, defineType } from "sanity";

export const pageType = defineType({
  name: "page",
  title: "Textbook Page",
  type: "document",
  fields: [
    defineField({
      name: "textbook",
      title: "Textbook",
      type: "reference",
      to: [{ type: "textbook" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "pageNumber",
      title: "Page Number",
      type: "number",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "content",
      title: "Page Content (Text)",
      type: "text",
      description: "Extracted text from this page",
    }),
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      description: "Optional: Chapter/section title for this page",
    }),
  ],
});