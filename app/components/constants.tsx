export const LLM_MODELS = [
  { id: 1, name: "GPT-4.1" },
  { id: 2, name: "GPT-4.1-mini" },
  { id: 3, name: "GPT-4.1-nano" },
  { id: 5, name: "GPT-4o" },
  { id: 6, name: "GPT-4o-mini" },
  { id: 13, name: "Gemini 2.5 Pro" },
  { id: 14, name: "Gemini 2.5 Flash" },
  { id: 16, name: "GPT-5" },
  { id: 17, name: "GPT-5 Mini" },
];

export const INPUT_TYPES = [
  { id: 1, name: "Image + Text" },
  { id: 2, name: "Text Only" },
];

export const OUTPUT_TYPES = [
  { id: 1, name: "String" },
  { id: 2, name: "Array" },
];

export const STEP_TYPES = [
  { id: 1, name: "Celebrity Recognition" },
  { id: 2, name: "Image Description" },
  { id: 3, name: "General" },
];

export const defaultStepForm = () => ({
  description: "",
  llm_system_prompt: "",
  llm_user_prompt: "",
  llm_temperature: 0.7,
  llm_input_type_id: 1,
  llm_output_type_id: 1,
  llm_model_id: 1,
  humor_flavor_step_type_id: 3,
});
