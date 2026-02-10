import { defineField, defineType } from "sanity";

export const socraticType = defineType({
  name: "Socratic",
  title: "Socratic Question",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "neuron",
      title: "Related Neurons",
      type: "array",
      of: [{ type: "reference", to: [{ type: "neuron" }] }],
    }),
    defineField({
      name: "question",
      title: "Socratic Question",
      type: "string",
    }),
    defineField({
      name: "userResponse",
      title: "Your Response",
      type: "text",
    }),
    defineField({
      name: "feedback",
      title: "AI Feedback",
      type: "text",
    }),
    defineField({
      name: "confidenceScore",
      title: "Confidence Score (1-5)",
      type: "number",
      validation: (Rule) => Rule.min(1).max(5).integer(),
    }),
    defineField({
      name: "resources",
      title: "Learning Resources",
      type: "array",
      description: "Supplemental materials to help you master this concept.",
      of: [
        {
          type: "object",
          name: "resource",
          fields: [
            defineField({
              name: "type",
              title: "Resource Type",
              type: "string",
              options: {
                list: [
                  { title: "Video Lecture", value: "video" },
                  { title: "Article/Documentation", value: "article" },
                  { title: "Podcast/Audio", value: "audio" },
                  { title: "Interactive Simulation", value: "sim" },
                ],
              },
            }),
            defineField({
              name: "title",
              title: "Label",
              type: "string",
              placeholder: "e.g., Khan Academy: Intro to Orbitals",
            }),
            defineField({
              name: "url",
              title: "Link",
              type: "url",
            }),
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "type",
            },
          },
        },
      ],
    }),
  ],
});
