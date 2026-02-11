import { defineField, defineType } from "sanity";

export const masteryType = defineType({
  name: "mastery",
  title: "Mastery",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "user",
      title: "Owner",
      type: "reference",
      to: [{ type: "user" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "srs",
      title: "Spaced Repetition Data",
      type: "object",
      fields: [
        defineField({
          name: "lastReviewed",
          title: "Last Reviewed At",
          type: "datetime",
        }),
        defineField({
          name: "nextReviewDate",
          title: "Next Scheduled Review",
          type: "datetime",
        }),
        defineField({
          name: "confidence",
          title: "Confidencey",
          type: "number",
          description:
            "Your confidence for retrieving without looking into your notes",
          initialValue: 1,
        }),
        defineField({
          name: "interval",
          title: "Current Interval (Days)",
          type: "number",
          initialValue: 0,
        }),
        defineField({
          name: "neurons",
          title: "Related Neurons",
          type: "array",
          of: [{ type: "reference", to: [{ type: "neuron" }] }],
        }),
      ],
    }),
  ],
});
