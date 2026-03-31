export type DeviceCategory = "iPhone" | "Mac";

export type AppleDevice = {
  id: string;
  name: string;
  category: DeviceCategory;
  glbPath: string;
  hasRealModel?: boolean;
  screenMeshName: string;
  screenAspect: number;
  thumbnailLabel: string;
  fallbackVariant: "phone" | "tablet" | "laptop";
  frameMargin?: number;
  modelScale?: number;
  modelRotation?: [number, number, number];
  modelPosition?: [number, number, number];
};

export const devices: AppleDevice[] = [
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro",
    category: "iPhone",
    glbPath: "/models/iphone-16-pro.glb",
    hasRealModel: true,
    screenMeshName: "xXDHkMplTIDAXLN",
    screenAspect: 9 / 19.5,
    thumbnailLabel: "6.3",
    fallbackVariant: "phone",
    frameMargin: 0.4,
    modelScale: 8.76,
    modelRotation: [0, Math.PI, 0],
    modelPosition: [0, 0.12, 0],
  },
  {
    id: "iphone-16-pro-max",
    name: "iPhone 16 Pro Max",
    category: "iPhone",
    glbPath: "/models/iphone-16-pro.glb",
    hasRealModel: true,
    screenMeshName: "xXDHkMplTIDAXLN",
    screenAspect: 9 / 19.5,
    thumbnailLabel: "6.9",
    fallbackVariant: "phone",
    frameMargin: 0.41,
    modelScale: 9.02,
    modelRotation: [0, Math.PI, 0],
    modelPosition: [0, 0.12, 0],
  },
  {
    id: "macbook-pro-14",
    name: "MacBook Pro 14",
    category: "Mac",
    glbPath: "/models/macbook-pro-14.glb",
    hasRealModel: true,
    screenMeshName: "Object_123",
    screenAspect: 14 / 9,
    thumbnailLabel: "14",
    fallbackVariant: "laptop",
    frameMargin: 77.8,
    modelScale: 0.1158,
    modelRotation: [0, 0, 0],
    modelPosition: [0, -0.18, 0],
  },
];

export const deviceGroups = devices.reduce<Record<DeviceCategory, AppleDevice[]>>(
  (groups, device) => {
    groups[device.category].push(device);
    return groups;
  },
  {
    iPhone: [],
    Mac: [],
  },
);

export const getDeviceById = (deviceId: string) =>
  devices.find((device) => device.id === deviceId) ?? devices[0];
