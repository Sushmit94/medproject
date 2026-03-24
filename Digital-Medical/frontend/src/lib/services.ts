import { api } from "./api";

// ── Common Types ──
export interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

// ── Upload ──
export const uploadService = {
  image: (file: File, folder?: string) => {
    const fd = new FormData();
    fd.append("file", file);
    if (folder) fd.append("folder", folder);
    return api.upload<{ url: string }>("/upload/image", fd);
  },
  document: (file: File, folder?: string) => {
    const fd = new FormData();
    fd.append("file", file);
    if (folder) fd.append("folder", folder);
    return api.upload<{ url: string }>("/upload/document", fd);
  },
  remove: (url: string) => api.delete("/upload", { url }),
};

// ── Auth ──
export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  phone: string;
  email?: string;
  password: string;
}

export interface BusinessSignupPayload {
  name: string;
  businessName: string;
  phone: string;
  email?: string;
  password: string;
  categoryId: string;
  areaId?: string;
  address?: string;
  supplyChainRole?: "MANUFACTURER" | "WHOLESALER" | "RETAILER";
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
  business: {
    id: string;
    name: string;
    businessId: string;
    status: string;
    categoryId?: string;
    supplyChainRole?: string | null;
    category?: {
      slug: string;
      hasDealsIn: boolean;
      hasProducts: boolean;
      hasServices: boolean;
    };
  } | null;
}

export const authService = {
  login: (data: LoginPayload) => api.post<AuthResponse>("/auth/login", data),
  signup: (data: SignupPayload) => api.post<AuthResponse>("/auth/signup", data),
  businessSignup: (data: BusinessSignupPayload) =>
    api.post<AuthResponse>("/auth/business/signup", data),
  me: () => api.get<AuthResponse["user"] & { business?: AuthResponse["business"] }>("/auth/me"),
};

// ── OTP ──
export const otpService = {
  send: (data: { phone?: string; email?: string; purpose?: string }) =>
    api.post<{ message: string }>("/otp/send", data),
  verify: (data: { phone?: string; email?: string; code: string; purpose?: string }) =>
    api.post<{ verified: boolean }>("/otp/verify", data),
};

// ── Categories ──
export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  isService: boolean;
  _count: { businesses: number };
}

export interface CategoryDetail extends CategoryItem {
  subcategories: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    _count: { businesses: number };
  }[];
}

export const categoryService = {
  list: () => api.get<CategoryItem[]>("/categories"),
  listAll: () => api.get<CategoryItem[]>("/categories?all=true"),
  getBySlug: (slug: string) => api.get<CategoryDetail>(`/categories/${slug}`),
  create: (data: Partial<CategoryItem>) => api.post<CategoryItem>("/categories", data),
  update: (id: string, data: Partial<CategoryItem>) => api.patch<CategoryItem>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
  createSubcategory: (categoryId: string, data: { name: string; slug: string; icon?: string }) =>
    api.post(`/categories/${categoryId}/subcategories`, data),
};

// ── Locations ──
export interface LocationItem {
  id: string;
  name: string;
}

export const locationService = {
  states: () => api.get<LocationItem[]>("/locations/states"),
  districts: (stateId: string) =>
    api.get<LocationItem[]>(`/locations/states/${stateId}/districts`),
  cities: (districtId: string) =>
    api.get<LocationItem[]>(`/locations/districts/${districtId}/cities`),
  areas: (cityId: string) =>
    api.get<LocationItem[]>(`/locations/cities/${cityId}/areas`),
  createState: (data: { name: string }) => api.post("/locations/states", data),
  createDistrict: (data: { name: string; stateId: string }) => api.post("/locations/districts", data),
  createCity: (data: { name: string; districtId: string }) => api.post("/locations/cities", data),
  createArea: (data: { name: string; cityId: string }) => api.post("/locations/areas", data),
};

// ── Search ──
export interface PublicBusinessCard {
  id: string;
  businessId?: string;
  name: string;
  slug: string;
  image: string | null;
  address: string | null;
  phone1: string | null;
  designation: string | null;
  isPopular: boolean;
  isVerified: boolean;
  subscriptionTier: string;
  category: { name: string; slug: string };
  area: { name: string; city: { name: string } } | null;
  _count?: { reviews: number };
}

export const searchService = {
  businesses: (params: string) => api.get<PaginatedResponse<PublicBusinessCard>>(`/search?${params}`),
};

// ── Business Profile ──
export interface BusinessProfile {
  id: string;
  businessId: string;
  name: string;
  user?: { name: string };
  slug: string;
  about: string | null;
  address: string | null;
  phone1: string | null;
  phone2: string | null;
  phone3: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  googleMaps: string | null;
  latitude: number | null;
  longitude: number | null;
  morningOpen: string | null;
  morningClose: string | null;
  eveningOpen: string | null;
  eveningClose: string | null;
  image: string | null;
  coverImage: string | null;
  designation: string | null;
  status: string;
  supplyChainRole: string | null;
  subscriptionTier: string;
  isPopular: boolean;
  isVerified: boolean;
  isEmergency: boolean;
  category: { id: string; name: string; slug: string };
  area: { id: string; name: string; city: { id: string; name: string; district: { id: string; name: string; state: { id: string; name: string } } } } | null;
}

export const businessService = {
  getMyProfile: () => api.get<BusinessProfile>("/businesses/me"),
  updateProfile: (data: Partial<BusinessProfile>) => api.patch<BusinessProfile>("/businesses/me", data),
  list: (params?: string) => api.get<PaginatedResponse<BusinessProfile>>(`/businesses${params ? `?${params}` : ""}`),
  getBySlug: (slug: string) => api.get<BusinessProfile>(`/businesses/${slug}`),
};

// ── Licenses ──
export interface License {
  id: string;
  businessId: string;
  type: string;
  licenseNo: string;
  issuedBy: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  document: string | null;
  status: string;
  rejectionNote: string | null;
  createdAt: string;
}

export const licenseService = {
  myLicenses: () => api.get<{ data: License[] }>("/licenses/my"),
  create: (data: Partial<License>) => api.post<{ data: License }>("/licenses", data),
  update: (id: string, data: Partial<License>) => api.patch<{ data: License }>(`/licenses/${id}`, data),
  // Admin
  listAll: (params?: string) => api.get<PaginatedResponse<License>>(`/licenses/admin/all${params ? `?${params}` : ""}`),
  verify: (id: string, data: { status: string; rejectionNote?: string }) =>
    api.patch(`/licenses/admin/${id}/verify`, data),
};

// ── Staff ──
export interface StaffMember {
  id: string;
  businessId: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  photo: string | null;
  birthday: string | null;
  anniversary: string | null;
  isActive: boolean;
  createdAt: string;
}

export const staffService = {
  myStaff: () => api.get<{ data: StaffMember[] }>("/staff/my"),
  create: (data: Partial<StaffMember>) => api.post<{ data: StaffMember }>("/staff", data),
  update: (id: string, data: Partial<StaffMember>) => api.patch<{ data: StaffMember }>(`/staff/${id}`, data),
  delete: (id: string) => api.delete(`/staff/${id}`),
};

// ── Products ──
export interface Product {
  id: string;
  businessId: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  sku: string | null;
  packSize: string | null;
  moq: number | null;
  categoryTag: string | null;
  productCategoryId: string | null;
  image: string | null;
  images: string[];
  isActive: boolean;
  createdAt: string;
}

export const productService = {
  myProducts: (params?: string) => api.get<PaginatedResponse<Product>>(`/products/my${params ? `?${params}` : ""}`),
  create: (data: Partial<Product>) => api.post<{ data: Product }>("/products", data),
  update: (id: string, data: Partial<Product>) => api.patch<{ data: Product }>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  publicForBusiness: (businessId: string, params?: string) =>
    api.get<PaginatedResponse<Product>>(`/products/public/${businessId}${params ? `?${params}` : ""}`),
};

// ── Product Categories (per-category dropdown options) ──
export interface ProductCategoryItem {
  id: string;
  name: string;
  slug: string;
}

export const productCategoryService = {
  byCategory: (categoryId: string) =>
    api.get<{ data: ProductCategoryItem[] }>(`/product-categories/by-category/${categoryId}`),
};

// ── Deals ("Deals In") ──
export interface Deal {
  id: string;
  businessId: string;
  title: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export const dealService = {
  my: () => api.get<{ data: Deal[] }>("/deals/my"),
  create: (data: Partial<Deal>) => api.post<{ data: Deal }>("/deals", data),
  update: (id: string, data: Partial<Deal>) => api.patch<{ data: Deal }>(`/deals/${id}`, data),
  delete: (id: string) => api.delete(`/deals/${id}`),
  forBusiness: (businessId: string) => api.get<{ data: Deal[] }>(`/deals/business/${businessId}`),
};

// ── Business Services ──
export interface BusinessServiceItem {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  image: string | null;
  price: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export const businessServiceService = {
  my: () => api.get<{ data: BusinessServiceItem[] }>("/business-services/my"),
  create: (data: Partial<BusinessServiceItem>) => api.post<{ data: BusinessServiceItem }>("/business-services", data),
  update: (id: string, data: Partial<BusinessServiceItem>) =>
    api.patch<{ data: BusinessServiceItem }>(`/business-services/${id}`, data),
  delete: (id: string) => api.delete(`/business-services/${id}`),
  forBusiness: (businessId: string) =>
    api.get<{ data: BusinessServiceItem[] }>(`/business-services/business/${businessId}`),
};

// ── Orders/Inquiries ──
export interface OrderInquiry {
  id: string;
  buyerId: string;
  supplierId: string;
  productId: string | null;
  productName: string;
  quantity: number;
  unit: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  buyer?: { name: string; phone1: string };
  supplier?: { name: string };
  product?: { name: string };
}

export const orderService = {
  sent: (params?: string) => api.get<PaginatedResponse<OrderInquiry>>(`/orders/sent${params ? `?${params}` : ""}`),
  received: (params?: string) => api.get<PaginatedResponse<OrderInquiry>>(`/orders/received${params ? `?${params}` : ""}`),
  create: (data: { supplierId: string; productId?: string; productName: string; quantity: number; unit?: string; notes?: string }) =>
    api.post<{ data: OrderInquiry }>("/orders", data),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
};

// ── Suppliers (Supply-Chain Browsing) ──
export interface SupplierCard {
  id: string;
  businessId: string;
  name: string;
  slug: string;
  image: string | null;
  address: string | null;
  phone1: string | null;
  supplyChainRole: string;
  area: { name: string; city: { name: string } } | null;
  _count: { products: number; deals: number; services: number };
}

export interface SupplierDetail extends SupplierCard {
  about: string | null;
  whatsapp: string | null;
  deals: { id: string; title: string; description: string | null; image: string | null }[];
  services: { id: string; name: string; description: string | null; image: string | null }[];
}

export interface SupplierProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  packSize: string | null;
  moq: number | null;
  image: string | null;
  business: { id: string; name: string; slug: string; phone1: string | null; image: string | null };
}

export const supplierService = {
  list: (params?: string) => api.get<PaginatedResponse<SupplierCard>>(`/suppliers${params ? `?${params}` : ""}`),
  detail: (id: string) => api.get<{ data: SupplierDetail }>(`/suppliers/${id}`),
  products: (id: string, params?: string) => api.get<PaginatedResponse<SupplierProduct>>(`/suppliers/${id}/products${params ? `?${params}` : ""}`),
  searchProducts: (params: string) => api.get<PaginatedResponse<SupplierProduct>>(`/suppliers/products/search?${params}`),
};

// ── Reviews ──
export interface Review {
  id: string;
  userId: string;
  businessId: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  user?: { name: string; avatar: string | null };
  business?: { name: string; slug: string };
}

export const reviewService = {
  forBusiness: (businessId: string, params?: string) =>
    api.get<PaginatedResponse<Review>>(`/reviews/business/${businessId}${params ? `?${params}` : ""}`),
  create: (data: { businessId: string; rating: number; comment?: string }) =>
    api.post<{ data: Review }>("/reviews", data),
  // Admin
  pending: () => api.get<{ data: Review[] }>("/reviews/admin/pending"),
  moderate: (id: string, data: { action: "approve" | "delete" }) =>
    api.patch(`/reviews/admin/${id}`, data),
};

// ── Notifications ──
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  list: (params?: string) =>
    api.get<PaginatedResponse<Notification> & { unreadCount: number }>(`/notifications${params ? `?${params}` : ""}`),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`, {}),
  markAllRead: () => api.patch("/notifications/read-all", {}),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  broadcast: (data: { title: string; message: string; link?: string; targetRole?: string }) =>
    api.post("/notifications/broadcast", data),
};

// ── Content ──
export interface NewsItem {
  id: string;
  title: string;
  link: string;
  type: string;
  image: string | null;
  cityId: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface BlogItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  thumbnail: string | null;
  bannerImage: string | null;
  cityId: string | null;
  isActive: boolean;
  createdAt: string;
}

export const contentService = {
  news: (params?: string) => api.get<PaginatedResponse<NewsItem>>(`/content/news${params ? `?${params}` : ""}`),
  blogs: (params?: string) => api.get<PaginatedResponse<BlogItem>>(`/content/blogs${params ? `?${params}` : ""}`),
  blogBySlug: (slug: string) => api.get<{ data: BlogItem }>(`/content/blogs/${slug}`),
  createNews: (data: Partial<NewsItem>) => api.post<{ data: NewsItem }>("/content/news", data),
  updateNews: (id: string, data: Partial<NewsItem>) => api.patch<{ data: NewsItem }>(`/content/news/${id}`, data),
  deleteNews: (id: string) => api.delete(`/content/news/${id}`),
  createBlog: (data: Partial<BlogItem>) => api.post<{ data: BlogItem }>("/content/blogs", data),
  updateBlog: (id: string, data: Partial<BlogItem>) => api.patch<{ data: BlogItem }>(`/content/blogs/${id}`, data),
  deleteBlog: (id: string) => api.delete(`/content/blogs/${id}`),
};

// ── Ads ──
export interface Ad {
  id: string;
  title: string;
  image: string | null;
  link: string | null;
  placement: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  businessId: string | null;
  createdAt: string;
}

export const adService = {
  list: (params?: string) => api.get<PaginatedResponse<Ad>>(`/ads${params ? `?${params}` : ""}`),
  create: (data: Partial<Ad>) => api.post<{ data: Ad }>("/ads", data),
  update: (id: string, data: Partial<Ad>) => api.patch<{ data: Ad }>(`/ads/${id}`, data),
  delete: (id: string) => api.delete(`/ads/${id}`),
};

// ── Camps ──
export interface Camp {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  businessId: string;
  eventDate: string;
  timeFrom: string | null;
  timeTo: string | null;
  venue: string | null;
  isActive: boolean;
  createdAt: string;
  business?: { id: string; name: string; slug: string };
  _count?: { registrations: number };
}

export const campService = {
  list: (params?: string) => api.get<PaginatedResponse<Camp>>(`/camps${params ? `?${params}` : ""}`),
  getBySlug: (slug: string) => api.get<{ data: Camp }>(`/camps/${slug}`),
  create: (data: Partial<Camp>) => api.post<{ data: Camp }>("/camps", data),
  update: (id: string, data: Partial<Camp>) => api.patch<{ data: Camp }>(`/camps/${id}`, data),
  delete: (id: string) => api.delete(`/camps/${id}`),
  register: (id: string, data: { name: string; phone: string; whatsapp?: string; age?: number; gender?: string }) =>
    api.post(`/camps/${id}/register`, data),
  registrations: (id: string) => api.get<{ data: unknown[] }>(`/camps/${id}/registrations`),
};

// ── Jobs ──
export interface Job {
  id: string;
  businessId: string;
  jobCategoryId: string;
  title: string;
  slug: string;
  description: string | null;
  salary: string | null;
  education: string | null;
  experience: string | null;
  ageRange: string | null;
  gender: string | null;
  selectionProcess: string | null;
  lastDate: string | null;
  isActive: boolean;
  createdAt: string;
  business?: { id: string; name: string; slug: string; image: string | null; area?: { name: string; city: { name: string } } };
  jobCategory?: { id: string; name: string };
}

export const jobService = {
  categories: () => api.get<{ data: { id: string; name: string; slug: string; _count: { jobs: number } }[] }>("/jobs/categories"),
  list: (params?: string) => api.get<PaginatedResponse<Job>>(`/jobs${params ? `?${params}` : ""}`),
  getBySlug: (slug: string) => api.get<{ data: Job }>(`/jobs/${slug}`),
  create: (data: Partial<Job>) => api.post<{ data: Job }>("/jobs", data),
  update: (id: string, data: Partial<Job>) => api.patch<{ data: Job }>(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
  apply: (id: string, data: Record<string, unknown>) => api.post(`/jobs/${id}/apply`, data),
  applications: (jobId: string) => api.get<{ data: unknown[] }>(`/jobs/${jobId}/applications`),
};

// ── Blood ──
export interface BloodDonor {
  id: string;
  bloodGroup: string;
  cityId: string | null;
  districtId: string | null;
  status: string;
  isAvailable: boolean;
  user: { name: string; phone: string };
}

export interface BloodRequest {
  id: string;
  attendantName: string;
  attendantPhone: string;
  patientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  urgency: string;
  hospitalName: string;
  isFulfilled: boolean;
  createdAt: string;
  user: { name: string };
}

export const bloodService = {
  registerDonor: (data: { bloodGroup: string; stateId?: string; districtId?: string; cityId?: string; address?: string }) =>
    api.post("/blood/donors/register", data),
  searchDonors: (params?: string) => api.get<PaginatedResponse<BloodDonor>>(`/blood/donors${params ? `?${params}` : ""}`),
  createRequest: (data: Record<string, unknown>) => api.post("/blood/requests", data),
  listRequests: (params?: string) => api.get<PaginatedResponse<BloodRequest>>(`/blood/requests${params ? `?${params}` : ""}`),
};

// ── Admin ──
export interface AdminUser {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  business: { id: string; businessId: string; name: string; status: string } | null;
}

export const adminService = {
  dashboard: () => api.get<{ data: Record<string, number> }>("/admin/stats"),
  users: (params?: string) => api.get<PaginatedResponse<AdminUser>>(`/admin/users${params ? `?${params}` : ""}`),
  toggleUser: (id: string) => api.patch(`/admin/users/${id}/toggle`, {}),
  businesses: (params?: string) => api.get<PaginatedResponse<BusinessProfile>>(`/admin/businesses${params ? `?${params}` : ""}`),
  pendingBusinesses: () => api.get<{ data: BusinessProfile[] }>("/admin/businesses/pending"),
  updateBusinessStatus: (id: string, status: string) =>
    api.patch(`/businesses/${id}/status`, { status }),
  updateBusiness: (id: string, data: Record<string, unknown>) =>
    api.patch(`/businesses/${id}/admin`, data),
  createAdmin: (data: { name: string; phone: string; email?: string; password: string }) =>
    api.post("/admin/users/admin", data),
  // License admin
  allLicenses: (params?: string) => licenseService.listAll(params),
  verifyLicense: (id: string, data: { status: string; rejectionNote?: string }) => licenseService.verify(id, data),
  // Review admin
  pendingReviews: () => reviewService.pending(),
  moderateReview: (id: string, data: { action: "approve" | "delete" }) => reviewService.moderate(id, data),
  // Contact
  contacts: (params?: string) => api.get<PaginatedResponse<unknown>>(`/inquiries/contact${params ? `?${params}` : ""}`),
  markContactRead: (id: string) => api.patch(`/inquiries/contact/${id}/read`, {}),
};

// ── Gallery ──
export interface GalleryItem {
  id: string;
  businessId: string | null;
  type: string;
  url: string;
  caption: string | null;
  cityId: string | null;
  createdAt: string;
}

export const galleryService = {
  list: (params?: string) => api.get<PaginatedResponse<GalleryItem>>(`/content/gallery${params ? `?${params}` : ""}`),
  create: (data: { type: string; url: string; caption?: string; cityId?: string }) =>
    api.post<{ data: GalleryItem }>("/content/gallery", data),
  delete: (id: string) => api.delete(`/content/gallery/${id}`),
};

// ── Coupons ──
export interface Coupon {
  id: string;
  businessId: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  business?: { id: string; name: string; slug: string };
  _count?: { registrations: number };
}

export const couponService = {
  list: (params?: string) => api.get<PaginatedResponse<Coupon>>(`/coupons${params ? `?${params}` : ""}`),
  myCoupons: () => api.get<{ data: Coupon[] }>("/coupons/my"),
  getBySlug: (slug: string) => api.get<{ data: Coupon }>(`/coupons/${slug}`),
  create: (data: { code: string; name: string; description?: string; validUntil: string }) =>
    api.post<{ data: Coupon }>("/coupons", data),
  register: (id: string, data: { name: string; phone: string }) =>
    api.post(`/coupons/${id}/register`, data),
  registrations: (id: string) => api.get<{ data: unknown[] }>(`/coupons/${id}/registrations`),
  update: (id: string, data: { code?: string; name?: string; description?: string; validUntil?: string }) =>
    api.patch<{ data: Coupon }>(`/coupons/${id}`, data),
  delete: (id: string) => api.delete(`/coupons/${id}`),
};

// ── Contact ──
export const contactService = {
  submit: (data: { name: string; phone: string; email?: string; city?: string; subject?: string; message: string }) =>
    api.post("/inquiries/contact", data),
};
