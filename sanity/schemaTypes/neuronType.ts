import { defineField, defineType } from "sanity";

export const neuronType = defineType({
  name: "neuron",
  title: "Neuron",
  type: "document",
  fields: [
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
      name: "mastery",
      title: "Mastery",
      type: "reference",
      to: [{ type: "mastery" }],
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
