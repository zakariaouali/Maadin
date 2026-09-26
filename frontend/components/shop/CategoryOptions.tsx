import { useLocale } from "next-intl";
import { localizedName } from "@/lib/i18n-helpers";

export interface CategoryNode {
  id: number;
  name: string;
  name_fr?: string | null;
  name_ar?: string | null;
  localised_name?: string;
  children?: CategoryNode[];
}

/**
 * The <option> list for any category <select>: names in the visitor's
 * language, with each craft's sub-categories grouped beneath it.
 * Use it inside a <select>: <select><CategoryOptions categories={cats} /></select>
 */
export function CategoryOptions({ categories }: { categories: CategoryNode[] }) {
  const locale = useLocale();

  return (
    <>
      {categories.map((c) =>
        c.children && c.children.length > 0 ? (
          <optgroup key={c.id} label={localizedName(c, locale)}>
            <option value={c.id}>{localizedName(c, locale)}</option>
            {c.children.map((child) => (
              <option key={child.id} value={child.id}>
                {"  "}
                {localizedName(child, locale)}
              </option>
            ))}
          </optgroup>
        ) : (
          <option key={c.id} value={c.id}>
            {localizedName(c, locale)}
          </option>
        )
      )}
    </>
  );
}
