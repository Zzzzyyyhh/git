import type { Label12095DetailKey, LabelData } from "@/lib/labelSchema";

export const label12095WebsiteText = "www.longpai-food.com";
export const label12095DetailOrder: Label12095DetailKey[] = [
  "formalName",
  "ingredients",
  "allergen",
  "license",
  "standardCode",
  "storage",
  "shelfLife",
  "date",
  "usageMethod",
  "consignor",
  "consignorAddress",
  "consignorTel",
  "manufacturer",
  "countryOfOrigin",
  "manufacturerTel",
  "manufacturerAddress",
  "website"
];

export const label12095DetailLabels: Record<Label12095DetailKey, string> = {
  formalName: "产品名称：",
  ingredients: "配料表：",
  allergen: "致敏物质提示：",
  license: "食品生产许可证编号：",
  standardCode: "产品执行标准：",
  storage: "贮存条件：",
  shelfLife: "保质期：",
  date: "生产日期及保质期到期日：",
  usageMethod: "食用方法：",
  consignor: "委托商：",
  consignorAddress: "委托商地址：",
  consignorTel: "委托商电话：",
  manufacturer: "生产者名称：",
  countryOfOrigin: "产地：",
  manufacturerTel: "电话：",
  manufacturerAddress: "地址：",
  website: "官网："
};

export function renderLabel12095DetailValue(data: LabelData, key: Label12095DetailKey) {
  switch (key) {
    case "formalName":
      return `${data.productNameCn}${data.productFormalNameCn ? `(${data.productFormalNameCn})` : ""}`.trim();
    case "ingredients":
      return data.ingredients;
    case "allergen":
      return data.allergenDeclaration;
    case "license":
      return data.productionLicenseNumber;
    case "standardCode":
      return data.productStandardCode;
    case "storage":
      return data.storageCondition;
    case "shelfLife":
      return data.shelfLife;
    case "date":
      return data.productionDateAndLotNumber || data.expiryDate;
    case "usageMethod":
      return data.usageMethod;
    case "consignor":
      return data.consignor;
    case "consignorAddress":
      return data.consignorAddress;
    case "consignorTel":
      return data.consignorTel;
    case "manufacturer":
      return data.manufacturer;
    case "countryOfOrigin":
      return data.countryOfOrigin;
    case "manufacturerTel":
      return data.manufacturerTel;
    case "manufacturerAddress":
      return data.manufacturerAddress;
    case "website":
      return label12095WebsiteText;
  }
}
