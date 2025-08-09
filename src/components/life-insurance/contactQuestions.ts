
export interface ContactQuestion {
  id: string;
  title: string;
  subtitle?: string;
  type: "input" | "select";
  inputConfig?: {
    placeholder: string;
    type: string;
  };
  selectOptions?: Array<{ value: string; label: string; }>;
}

export const contactQuestions: ContactQuestion[] = [
  {
    id: "firstName",
    title: "What's your first name?",
    type: "input",
    inputConfig: {
      placeholder: "First Name",
      type: "text"
    }
  },
  {
    id: "lastName", 
    title: "What's your last name?",
    type: "input",
    inputConfig: {
      placeholder: "Last Name",
      type: "text"
    }
  },
  {
    id: "height",
    title: "What's your height?",
    type: "input",
    inputConfig: {
      placeholder: "e.g. 5'8\"",
      type: "text"
    }
  },
  {
    id: "weight",
    title: "What's your weight?",
    type: "input",
    inputConfig: {
      placeholder: "e.g. 150 lbs",
      type: "text"
    }
  },
  {
    id: "email",
    title: "What's your email address?",
    type: "input",
    inputConfig: {
      placeholder: "your@email.com",
      type: "email"
    }
  },
  {
    id: "callTime",
    title: "Best time to call you?",
    type: "select",
    selectOptions: [
      { value: "morning", label: "Morning (9AM - 12PM)" },
      { value: "afternoon", label: "Afternoon (12PM - 5PM)" },
      { value: "evening", label: "Evening (5PM - 8PM)" }
    ]
  },
  {
    id: "phone",
    title: "What's your phone number?",
    type: "input",
    inputConfig: {
              placeholder: "(888) 440-9669",
      type: "tel"
    }
  }
];
