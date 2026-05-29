export function rowCountry(row) {
  return row?.country ?? "All";
}

export function resolvedCountry(data, country) {
  if (country === "All") return "All";
  return data?.some((d) => rowCountry(d) === country) ? country : "All";
}

export function scopedRows(data, category, country) {
  if (!data) return [];
  const activeCountry = resolvedCountry(data, country);
  const byCategory = data.filter((d) => d.category === category);
  return byCategory.filter((d) => rowCountry(d) === activeCountry);
}

export function scopedDataset(data, country) {
  if (!data) return [];
  const activeCountry = resolvedCountry(data, country);
  return data.filter((d) => rowCountry(d) === activeCountry);
}

export function scopeLabel(country) {
  return country === "All" ? "all countries" : country;
}
