import React from "react";
import { competitionFormSchema } from "@/schema/fieldRegisterCompetition.schema";

type Props = {
  params: { id: string };
};

const getFieldsForCompetition = async (id: string) => {
  // Simulate fetching form schema based on the competition id
  return competitionFormSchema[id];
};
const Register = async ({ params }: Props) => {
  const id = (await params).id;
  const formConfig = await getFieldsForCompetition(id);
  return (
    <div>
      <form className="space-y-4 bg-background p-6 rounded-2xl shadow-md border">
        {formConfig.fields.map((field) => (
          <div key={field.name}>
            <label className="block mb-1">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              required={field.required}
              min={field.min}
              max={field.max}
              className="border px-3 py-2 w-full"
            />
          </div>
        ))}

        <button type="submit" className="bg-blue-600 text-white px-4 py-2">
          Daftar
        </button>
      </form>
    </div>
  );
};

export default Register;
