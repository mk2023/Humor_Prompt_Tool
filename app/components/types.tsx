export type Step = {
  id: number;
  order_by: number;
  description: string;
  llm_system_prompt: string;
  llm_user_prompt: string;
  llm_temperature: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
  llm_model_id: number;
  humor_flavor_step_type_id: number;
  created_datetime_utc: string;
};

export type Flavor = {
  id: number;
  slug: string;
  description: string;
  created_datetime_utc: string;
  humor_flavor_steps: Step[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isSuperAdmin: boolean;
  isMatrixAdmin: boolean;
};

export type StepForm = {
  description: string;
  llm_system_prompt: string;
  llm_user_prompt: string;
  llm_temperature: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
  llm_model_id: number;
  humor_flavor_step_type_id: number;
};

export type ThemeMode = "light" | "dark" | "system";
export type View = "flavors" | "test" | "captions";
