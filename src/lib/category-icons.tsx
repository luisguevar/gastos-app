import {
  IconToolsKitchen2,
  IconCar,
  IconHome,
  IconDeviceGamepad2,
  IconHeartbeat,
  IconShoppingBag,
  IconBulb,
  IconPlane,
  IconSchool,
  IconPaw,
  IconGift,
  IconPigMoney,
  IconDeviceLaptop,
  IconShirt,
  IconBarbell,
  IconGlassFull,
  IconCoffee,
  IconBuildingBank,
  IconCategory,
  type TablerIcon,
} from "@tabler/icons-react";

/** Catálogo de íconos disponibles para categorías. El `key` es lo que se
 * guarda en la columna categories.icon. */
export const CATEGORY_ICONS: { key: string; label: string; icon: TablerIcon }[] = [
  { key: "comida", label: "Comida", icon: IconToolsKitchen2 },
  { key: "restaurante", label: "Restaurante", icon: IconGlassFull },
  { key: "cafe", label: "Café", icon: IconCoffee },
  { key: "transporte", label: "Transporte", icon: IconCar },
  { key: "vivienda", label: "Vivienda", icon: IconHome },
  { key: "servicios", label: "Servicios", icon: IconBulb },
  { key: "compras", label: "Compras", icon: IconShoppingBag },
  { key: "ropa", label: "Ropa", icon: IconShirt },
  { key: "entretenimiento", label: "Entretenimiento", icon: IconDeviceGamepad2 },
  { key: "salud", label: "Salud", icon: IconHeartbeat },
  { key: "deporte", label: "Deporte", icon: IconBarbell },
  { key: "viajes", label: "Viajes", icon: IconPlane },
  { key: "educacion", label: "Educación", icon: IconSchool },
  { key: "mascotas", label: "Mascotas", icon: IconPaw },
  { key: "regalos", label: "Regalos", icon: IconGift },
  { key: "tecnologia", label: "Tecnología", icon: IconDeviceLaptop },
  { key: "ahorro", label: "Ahorro", icon: IconPigMoney },
  { key: "banco", label: "Banco", icon: IconBuildingBank },
  { key: "otros", label: "Otros", icon: IconCategory },
];

const ICON_MAP = new Map(CATEGORY_ICONS.map((i) => [i.key, i.icon]));

/** Ícono por defecto cuando la categoría no tiene ícono asignado. */
export const DEFAULT_CATEGORY_ICON: TablerIcon = IconCategory;

/** Devuelve el componente de ícono para una key guardada (o el por defecto). */
export function iconByKey(key: string | null | undefined): TablerIcon {
  if (!key) return DEFAULT_CATEGORY_ICON;
  return ICON_MAP.get(key) ?? DEFAULT_CATEGORY_ICON;
}
