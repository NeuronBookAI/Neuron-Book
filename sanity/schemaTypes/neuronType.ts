import { defineField, defineType } from "sanity";

export const neuronType = defineType({
  name: "neuron",
  title: "Neuron",
  type: "document",
  fields: [
    defineField({
      name: "user",
      title: "Owner",
      type: "reference",
      to: [{ type: "user" }],
    }),
    defineField({
      name: "title",
      title: "Neuron Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "synapses",
      title: "Synapses",
      description: "Connections to other neurons in the network.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "neuron" }] }],
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "masteryLevel",
      title: "Mastery Level (Strength)",
      description: "The current strength or proficiency of this neuron node.",
      type: "number",
      initialValue: 0,
      validation: (rule) => rule.min(0).max(100).precision(2),
    }),
    defineField({
      name: "isDemo",
      title: "Demo Content",
      description: "If true, this neuron is visible to all users as example content.",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
