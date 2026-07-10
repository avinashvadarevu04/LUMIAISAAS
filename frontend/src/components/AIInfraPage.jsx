import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Info,
  Server,
  Terminal,
  Cpu,
  Layers,
  Database,
  Shield,
  Activity,
  HardDrive,
  Check,
  ChevronRight,
  X,
  Loader2,
  Calendar,
  CloudLightning,
  Sparkles,
  PhoneCall,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "./Navbar";
import WhatsAppLoginModal from "./WhatsAppLoginModal";
import { playWelcomeChime } from "@/lib/sfx";
import { useUser } from "@/lib/userStore";
import Footer from "./Footer";

const SERVICES_DATA = [
  {
    id: "h100-instance",
    name: "NVIDIA H100 SXM5 Instances",
    category: "GPU Cloud",
    description: "On-demand high-performance NVIDIA H100 SXM5 GPU instances with 80GB HBM3 memory, ideal for massive LLM training and complex inference workflows.",
    features: ["80GB HBM3 memory", "3.2 Tbps InfiniBand interconnect", "SXM5 form factor", "Ready-to-use PyTorch & TensorFlow templates"],
    deploymentType: "Managed",
    gpu: "H100",
    region: "US-East",
    availability: "Immediate",
    startingPrice: "$2.35 / hour",
    sla: "99.95% Uptime SLA",
    technologies: ["NVIDIA SXM5", "InfiniBand", "Ubuntu 22.04", "Docker"],
    pricingModel: "Pay-as-you-go billing",
    overview: "Deploy raw AI power. LUMI AI NVIDIA H100 instances deliver unmatched throughput for modern deep learning. Perfectly balanced with high-speed local NVMe storage and state-of-the-art memory architectures."
  },
  {
    id: "a100-instance",
    name: "NVIDIA A100 PCIe Instances",
    category: "GPU Cloud",
    description: "Reliable, high-bandwidth NVIDIA A100 GPU compute instances with 80GB PCIe slots, designed for production fine-tuning and batch rendering jobs.",
    features: ["80GB PCIe memory", "600 GB/s NVLink connectivity", "Optimal price-to-performance ratio", "Pre-configured CUDA environments"],
    deploymentType: "Managed",
    gpu: "A100",
    region: "US-West",
    availability: "Immediate",
    startingPrice: "$1.40 / hour",
    sla: "99.95% Uptime SLA",
    technologies: ["NVIDIA PCIe", "NVLink", "PyTorch", "Kubernetes"],
    pricingModel: "Hourly billing or monthly contract",
    overview: "Get enterprise stability. LUMI AI's A100 compute options deliver robust parallelism for scaling deep learning pipelines. Backed by PCIe interface for seamless custom configuration."
  },
  {
    id: "l40s-cluster",
    name: "NVIDIA L40S Clusters",
    category: "GPU Cloud",
    description: "Multipurpose graphics and AI computing nodes based on NVIDIA L40S architecture, optimized for generative AI workloads and 3D pipelines.",
    features: ["48GB GDDR6 memory", "Optimized for FP8 precision", "Ray tracing core support", "High-speed Ethernet cluster links"],
    deploymentType: "Self-Managed",
    gpu: "L40S",
    region: "Europe",
    availability: "24 Hours",
    startingPrice: "$0.95 / hour",
    sla: "99.9% Uptime SLA",
    technologies: ["NVIDIA Ada Lovelace", "TensorRT", "Omniverse", "Linux"],
    pricingModel: "On-demand or reserved reservation",
    overview: "Unlock versatility. The NVIDIA L40S offers the premier option for multi-modal generation, virtual environments, and fine-tuning pipelines at highly competitive pricing."
  },
  {
    id: "llama3-hosting",
    name: "Private Llama 3 API Gateway",
    category: "AI Model Hosting",
    description: "Dedicated Llama 3 70B/8B model hosting with end-to-end encryption. Safe, private, and fully isolated within your dedicated virtual cloud environment.",
    features: ["Fully isolated client tenant", "Zero data retention policy", "OpenAI compatible API format", "Low latency token streaming"],
    deploymentType: "Managed",
    gpu: "A100",
    region: "US-East",
    availability: "Immediate",
    startingPrice: "$450 / month",
    sla: "99.99% API Availability",
    technologies: ["Llama 3 70B/8B", "vLLM engine", "FastAPI", "AES-256 Encryption"],
    pricingModel: "Flat monthly subscription with unlimited tokens",
    overview: "Run your private LLM. Eliminate public API data privacy concerns. Host Llama 3 models on isolated GPUs dedicated exclusively to your applications."
  },
  {
    id: "finetuning-infra",
    name: "Automated Fine-Tuning Server",
    category: "AI Model Hosting",
    description: "Deploy scalable training instances specialized for LoRA, QLoRA, and full parameter model fine-tuning with integrated telemetry panels.",
    features: ["One-click dataset upload", "Integrated weights & biases logger", "Distributed training templates", "Automated checkpoint backup"],
    deploymentType: "Self-Managed",
    gpu: "H100",
    region: "Asia",
    availability: "Immediate",
    startingPrice: "$1.65 / hour",
    sla: "99.9% Job Completion Guarantee",
    technologies: ["Hugging Face", "DeepSpeed", "QLoRA", "Kubernetes"],
    pricingModel: "Per-minute training execution cost",
    overview: "Fine-tune models effortlessly. Upload dataset files, choose target base models, and launch optimization tasks without worrying about manual CUDA configurations."
  },
  {
    id: "qdrant-managed",
    name: "Vector Store Gateway (Qdrant)",
    category: "Vector Databases",
    description: "High-performance vector database hosting powered by Qdrant. Fully managed storage, scaling, and semantic similarity indexing.",
    features: ["Million-vector scale capability", "Sub-millisecond similarity queries", "Payload filtering systems", "Automated cluster backup schedules"],
    deploymentType: "Managed",
    gpu: "None",
    region: "US-East",
    availability: "Immediate",
    startingPrice: "$59 / month",
    sla: "99.99% Database SLA",
    technologies: ["Qdrant", "gRPC", "REST API", "Raft consensus"],
    pricingModel: "Tiered subscription based on memory use",
    overview: "Index memory for your agent systems. The Vector Store Gateway delivers low-latency retrieval for Retrieval-Augmented Generation (RAG) and cognitive systems."
  },
  {
    id: "agent-runner-platform",
    name: "Autonomous Agent Runner Node",
    category: "AI Agent Infrastructure",
    description: "Deploy persistent, state-maintaining AI agents on isolated runners. Optimized for handling background automations and API hooks.",
    features: ["State storage & persistence", "Webhooks & scheduling engines", "Secure sandboxed execution environment", "Integrated logging & analytics"],
    deploymentType: "Managed",
    gpu: "None",
    region: "US-East",
    availability: "Immediate",
    startingPrice: "$120 / month",
    sla: "99.95% Agent Uptime SLA",
    technologies: ["LangChain", "NodeJS/Python", "Docker Sandbox", "Redis State Store"],
    pricingModel: "Flat billing per runner node",
    overview: "Power persistent intelligence. Deploy autonomous workers that operate 24/7, processing customer operations, syncs, or background analytical logic."
  },
  {
    id: "kubernetes-compute",
    name: "Managed GPU Kubernetes Clusters",
    category: "Cloud Compute",
    description: "Highly scalable, Kubernetes-managed compute environments with automated GPU provisioning, scaling, and custom config orchestration.",
    features: ["Automated node scaling", "GPU sharing configurations", "Pre-loaded Helm chart templates", "VPC & private network options"],
    deploymentType: "Managed",
    gpu: "A100",
    region: "US-West",
    availability: "Immediate",
    startingPrice: "$299 / month",
    sla: "99.95% Cluster Control Plane SLA",
    technologies: ["K8s", "Docker", "Helm", "Terraform"],
    pricingModel: "Base management cost + hourly node cost",
    overview: "Scale your compute cluster. Orchestrate complex model pipelines, microservices, and client systems on scalable, cloud-agnostic Kubernetes layers."
  },
  {
    id: "dataset-storage-s3",
    name: "High-Throughput Dataset Storage",
    category: "AI Storage",
    description: "Object storage system optimized for large-scale ML datasets, model checkpoints, and unstructured audio/video training files.",
    features: ["10 Gbps read/write throughput", "AWS S3 API compatibility", "Cross-region sync capability", "Built-in file versioning control"],
    deploymentType: "Managed",
    gpu: "None",
    region: "US-East",
    availability: "Immediate",
    startingPrice: "$0.02 / GB",
    sla: "99.999% Data Durability SLA",
    technologies: ["Ceph", "S3 Protocol", "MinIO Engine", "NVMe Cache"],
    pricingModel: "Storage use per GB + minimal transfer fee",
    overview: "Secure your core training data assets. Read and write raw data batches at extreme throughput to satisfy bandwidth requirements of multi-GPU servers."
  },
  {
    id: "ai-performance-monitor",
    name: "Model Telemetry & Monitor Panel",
    category: "Monitoring",
    description: "Real-time logging, drift detection, and latency tracking system for running production model APIs.",
    features: ["Real-time response tracking", "Data drift warning alerts", "GPU capacity logs", "Webhook alarm triggers"],
    deploymentType: "Managed",
    gpu: "None",
    region: "US-West",
    availability: "Immediate",
    startingPrice: "$79 / month",
    sla: "99.9% Telemetry SLA",
    technologies: ["Prometheus", "Grafana", "OTel", "ClickHouse"],
    pricingModel: "Flat monthly cost + telemetry metrics volume",
    overview: "Maintain full control of model health. Know instantly when LLMs experience performance degradation, data drift, or capacity bottlenecks."
  }
];

const CATEGORIES = [
  "All",
  "GPU Cloud",
  "AI Model Hosting",
  "Vector Databases",
  "AI Agent Infrastructure",
  "Cloud Compute",
  "AI Storage",
  "Security",
  "Monitoring"
];

const DEPLOYMENT_TYPES = ["All", "Managed", "Self-Managed"];
const REGIONS = ["All", "US-East", "US-West", "Europe", "Asia"];
const GPUS = ["All", "H100", "A100", "L40S", "None"];

export default function AIInfraPage() {
  // User auth state
  const [user, setUser] = useUser();
  const [loginOpen, setLoginOpen] = useState(false);
  const [modalIntent, setModalIntent] = useState("login");
  const [modalStep, setModalStep] = useState("choice");
  const [modalMode, setModalMode] = useState("signup");
  const [postAuthAction, setPostAuthAction] = useState(null);

  // Filters & search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDeployType, setSelectedDeployType] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedGPU, setSelectedGPU] = useState("All");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // UI loading state
  const [filtering, setFiltering] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [gpuCount, setGpuCount] = useState(1);
  const [ssdSize, setSsdSize] = useState(2);

  useEffect(() => {
    if (selectedService) {
      setGpuCount(1);
      setSsdSize(2);
    }
  }, [selectedService]);

  // Trigger loading skeleton on filter change
  useEffect(() => {
    setFiltering(true);
    const t = setTimeout(() => setFiltering(false), 350);
    return () => clearTimeout(t);
  }, [searchQuery, selectedCategory, selectedDeployType, selectedRegion, selectedGPU]);

  const openLogin = () => {
    setModalIntent("login");
    setModalStep("choice");
    setModalMode("signup");
    setLoginOpen(true);
  };

  const handleLogout = () => {
    setUser(null);
    toast("Signed out.", { description: "See you in the lab.", duration: 2400 });
  };

  const getCalculatedPrice = () => {
    if (!selectedService) return null;
    let hourlyBase = 0;
    if (selectedService.gpu === "H100") hourlyBase = 2.35;
    else if (selectedService.gpu === "A100") hourlyBase = 1.40;
    else if (selectedService.gpu === "L40S") hourlyBase = 0.95;
    else return null;

    const hourlySSD = ssdSize * 0.03;
    const totalHourly = (hourlyBase * gpuCount) + hourlySSD;
    const totalMonthly = totalHourly * 730;
    return {
      hourly: totalHourly.toFixed(2),
      monthly: Math.round(totalMonthly).toLocaleString(),
    };
  };

  const dynamicPrice = getCalculatedPrice();

  const handleLoginSubmit = async (payload) => {
    if (payload.isGoogle) {
      setUser({
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        role: payload.role,
        isGoogle: true,
        id: "google-user-id",
      });
      setLoginOpen(false);
      playWelcomeChime();
      toast.success(`Welcome, ${payload.name}.`, {
        description: "Signed in via Google. Ready to cook.",
        duration: 4200,
        icon: <CheckCircle2 className="h-5 w-5 text-[#25D366]" strokeWidth={2.6} />,
      });
      return;
    }

    const { phone, name, code, mode } = payload;
    const digits = (phone || "").replace(/\D/g, "");
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/api/leads`, {
        name: name || "",
        phone: digits,
        country_code: code || "+91",
        intent: "login",
        mode: mode || "signup",
        source: "ai-infra",
      });
      const saved = res.data;
      setUser({
        name: saved.name,
        phone: saved.full_phone,
        id: saved.id,
        role: "CLIENT",
        email: saved.name.toLowerCase().replace(/\s+/g, "") + "@example.com",
      });
      setLoginOpen(false);
      playWelcomeChime();
      toast.success(`Welcome, ${saved.name}.`, {
        description: "Account created.",
        duration: 4200,
        icon: <CheckCircle2 className="h-5 w-5 text-[#25D366]" strokeWidth={2.6} />,
      });
    } catch (err) {
      toast.error("Could not save your details.");
    }
  };

  const handleRequestService = (service) => {
    if (!user) {
      openLogin();
      return;
    }
    toast.success(`Request submitted for ${service.name}!`, {
      description: "Our infrastructure team will contact you in 12 hours.",
      duration: 5000
    });
  };

  // Filter logic
  const filteredServices = SERVICES_DATA.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
    const matchesDeploy = selectedDeployType === "All" || s.deploymentType === selectedDeployType;
    const matchesRegion = selectedRegion === "All" || s.region === selectedRegion;
    const matchesGPU = selectedGPU === "All" || s.gpu === selectedGPU;

    return matchesSearch && matchesCategory && matchesDeploy && matchesRegion && matchesGPU;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case "GPU Cloud": return Cpu;
      case "AI Model Hosting": return Terminal;
      case "Vector Databases": return Database;
      case "AI Agent Infrastructure": return Layers;
      case "Cloud Compute": return Server;
      case "AI Storage": return HardDrive;
      case "Security": return Shield;
      case "Monitoring": return Activity;
      default: return Server;
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-[#050a1a]">
      {/* Background blueprint grid */}
      <div className="absolute inset-0 bp-grid pointer-events-none opacity-40" aria-hidden="true" />
      <div className="absolute inset-0 bp-wash pointer-events-none" aria-hidden="true" />

      <Navbar user={user} onLoginClick={openLogin} onLogout={handleLogout} />

      <WhatsAppLoginModal
        open={loginOpen}
        intent={modalIntent}
        step={modalStep}
        onStepChange={setModalStep}
        mode={modalMode}
        onModeChange={setModalMode}
        onClose={() => setLoginOpen(false)}
        onSubmit={handleLoginSubmit}
      />

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative pt-32 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 mb-5 ring-1 ring-[#2455FF]/15"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2455FF]" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#050a1a]/60">
            Enterprise Compute Infrastructure
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="font-display text-[8vw] sm:text-[6vw] lg:text-[64px] leading-tight text-[#050a1a] tracking-tight max-w-4xl"
        >
          AI Infrastructure <span className="text-[#2455FF]">as a Service</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="mt-5 text-sm sm:text-base text-[#050a1a]/60 max-w-2xl leading-relaxed"
        >
          Deploy, scale, and manage enterprise AI infrastructure without managing the underlying cloud complexity. Scale compute dynamically on hardware designed for intelligence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="mt-8 flex flex-wrap gap-4 justify-center"
        >
          <a
            href="#marketplace"
            className="group relative inline-flex items-center gap-2 rounded-xl bg-[#2455FF] hover:bg-[#1a44e0] text-white px-5 py-3 text-[14px] font-semibold transition"
          >
            <span>Explore Services</span>
            <CloudLightning className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
          </a>
          <button
            onClick={() => {
              if (!user) openLogin();
              else {
                toast.success("Consultation booked!", {
                  description: "An AI Infrastructure strategist will contact you via WhatsApp shortly."
                });
              }
            }}
            className="group relative inline-flex items-center gap-2 rounded-xl border border-[#2455FF]/15 bg-white hover:bg-[#2455FF]/5 text-[#050a1a] px-5 py-3 text-[14px] font-semibold transition"
          >
            <span>Schedule Consultation</span>
            <Calendar className="h-4 w-4 shrink-0 text-[#2455FF]" />
          </button>
        </motion.div>
      </section>

      {/* ===================== MARKETPLACE AREA ===================== */}
      <section id="marketplace" className="max-w-7xl mx-auto px-6 pb-24 relative z-10">

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between mb-8">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#050a1a]/40" />
            <input
              type="text"
              placeholder="Search GPU instance, model hosting, vector stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/70 ring-1 ring-[#2455FF]/15 focus:ring-2 focus:ring-[#2455FF]/50 outline-none text-[14px] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-[#050a1a]/5 rounded-full flex items-center justify-center text-[#050a1a]/40 hover:text-[#050a1a] transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 border border-[#2455FF]/15 bg-white hover:bg-[#2455FF]/5 rounded-xl font-semibold text-[13.5px] transition"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Marketplace Grid */}
        <div className="flex gap-8 items-start">
          {/* Side Filters — Desktop */}
          <aside className="hidden lg:block w-64 shrink-0 bg-white/50 p-5 rounded-2xl border border-[#2455FF]/10 sticky top-24">
            <h2 className="font-cine text-[17px] tracking-[0.05em] text-[#050a1a] flex items-center gap-2 mb-4">
              <SlidersHorizontal className="h-4 w-4 text-[#2455FF]" />
              <span>Infrastructure Filters</span>
            </h2>

            <div className="space-y-5">
              {/* Categories */}
              <div>
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#050a1a]/50 block mb-2">Category</span>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition ${
                        selectedCategory === cat
                          ? "bg-[#2455FF]/8 text-[#2455FF] font-semibold"
                          : "text-[#050a1a]/70 hover:bg-[#050a1a]/5 hover:text-[#050a1a]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deployment Type */}
              <div>
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#050a1a]/50 block mb-2">Deployment</span>
                <div className="space-y-1">
                  {DEPLOYMENT_TYPES.map((dt) => (
                    <button
                      key={dt}
                      onClick={() => setSelectedDeployType(dt)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition ${
                        selectedDeployType === dt
                          ? "bg-[#2455FF]/8 text-[#2455FF] font-semibold"
                          : "text-[#050a1a]/70 hover:bg-[#050a1a]/5 hover:text-[#050a1a]"
                      }`}
                    >
                      {dt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Region */}
              <div>
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#050a1a]/50 block mb-2">Region</span>
                <div className="space-y-1">
                  {REGIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRegion(r)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition ${
                        selectedRegion === r
                          ? "bg-[#2455FF]/8 text-[#2455FF] font-semibold"
                          : "text-[#050a1a]/70 hover:bg-[#050a1a]/5 hover:text-[#050a1a]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* GPU Class */}
              <div>
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#050a1a]/50 block mb-2">GPU Class</span>
                <div className="space-y-1">
                  {GPUS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGPU(g)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition ${
                        selectedGPU === g
                          ? "bg-[#2455FF]/8 text-[#2455FF] font-semibold"
                          : "text-[#050a1a]/70 hover:bg-[#050a1a]/5 hover:text-[#050a1a]"
                      }`}
                    >
                      {g === "None" ? "CPU Only" : g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Catalog Listing */}
          <div className="flex-1">
            {filtering ? (
              // Loading Skeletons
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="border border-[#2455FF]/10 rounded-2xl p-5 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-9 w-9 rounded-xl bg-gray-100 animate-pulse" />
                      <div className="h-5 w-16 rounded-full bg-gray-100 animate-pulse" />
                    </div>
                    <div className="h-6 w-3/4 rounded bg-gray-100 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
                      <div className="h-4 w-5/6 rounded bg-gray-100 animate-pulse" />
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-5 w-20 rounded bg-gray-100 animate-pulse" />
                      <div className="h-9 w-24 rounded bg-gray-100 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredServices.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[#2455FF]/20 rounded-2xl bg-white/50">
                <CloudLightning className="h-10 w-10 text-[#2455FF]/50 mb-3 animate-bounce" />
                <h3 className="font-cine text-lg tracking-wider text-[#050a1a]">No matching services</h3>
                <p className="text-[13px] text-[#050a1a]/60 max-w-sm mt-1.5 px-6 leading-relaxed">
                  Try adjusting filters or changing your search terms to explore other LUMI AI Infrastructure options.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedDeployType("All");
                    setSelectedRegion("All");
                    setSelectedGPU("All");
                    setSearchQuery("");
                  }}
                  className="mt-4 font-mono text-[11.5px] text-[#2455FF] font-semibold hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              // Service Cards Grid
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredServices.map((service) => {
                  const CategoryIcon = getCategoryIcon(service.category);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      key={service.id}
                      className="group flex flex-col justify-between border border-[#2455FF]/10 rounded-2xl p-5 sm:p-6 bg-white hover:border-[#2455FF]/30 hover:shadow-[0_12px_30px_-15px_rgba(36,85,255,0.15)] transition-all duration-300"
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#2455FF]/8 text-[#2455FF]">
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center rounded-full bg-[#050a1a]/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#050a1a]/60 font-semibold leading-none">
                              {service.deploymentType}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-[#2455FF]/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#2455FF] font-semibold leading-none">
                              {service.region}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="mt-4 font-cine text-[18px] tracking-[0.02em] font-semibold text-[#050a1a]">
                          {service.name}
                        </h3>

                        {/* Description */}
                        <p className="mt-2.5 text-[12.5px] leading-relaxed text-[#050a1a]/60 line-clamp-3">
                          {service.description}
                        </p>

                        {/* Feature bullets */}
                        <ul className="mt-4 space-y-1.5">
                          {service.features.slice(0, 3).map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-[12px] text-[#050a1a]/70">
                              <Check className="h-3.5 w-3.5 text-[#2455FF] shrink-0" strokeWidth={3} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Footer actions */}
                      <div>
                        <div className="h-px bg-[#2455FF]/10 my-5" />

                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <span className="font-mono text-[9px] uppercase text-[#050a1a]/40 tracking-wider block">Starting from</span>
                            <span className="font-cine text-[16px] tracking-wide text-[#2455FF] font-bold">
                              {service.startingPrice}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedService(service)}
                              className="px-3 py-2 border border-[#2455FF]/15 hover:bg-[#2455FF]/5 rounded-xl font-semibold text-[12.5px] transition"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleRequestService(service)}
                              className="px-3.5 py-2 bg-[#050a1a] hover:bg-[#0b1530] text-white rounded-xl font-semibold text-[12.5px] transition"
                            >
                              Request
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===================== DETAIL DIALOG / MODAL ===================== */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050a1a]/40 backdrop-blur-sm"
          >
            <button
              onClick={() => setSelectedService(null)}
              aria-label="Close"
              className="absolute inset-0 cursor-default outline-none"
            />

            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#2455FF]/15 p-6 max-h-[85vh] overflow-y-auto z-10 shadow-2xl flex flex-col justify-between"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedService(null)}
                aria-label="Close detail modal"
                className="absolute top-4 right-4 h-7 w-7 rounded-full bg-[#050a1a]/5 hover:bg-[#050a1a]/10 flex items-center justify-center text-[#050a1a]/60 hover:text-rose-600 transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div>
                {/* Header */}
                <div className="flex flex-wrap items-center gap-2 pr-8">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#2455FF] bg-[#2455FF]/8 px-2.5 py-0.5 rounded-full font-semibold">
                    {selectedService.category}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#050a1a]/55 bg-[#050a1a]/5 px-2.5 py-0.5 rounded-full font-semibold">
                    {selectedService.deploymentType}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#00E5FF] bg-[#00E5FF]/8 px-2.5 py-0.5 rounded-full font-semibold">
                    {selectedService.region}
                  </span>
                </div>

                <h2 className="mt-3 font-cine text-[24px] tracking-wide text-[#050a1a] font-bold">
                  {selectedService.name}
                </h2>

                <div className="h-px bg-[#2455FF]/10 my-4" />

                {/* Main Body */}
                <div className="space-y-4">
<div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#050a1a]/50">Overview</span>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#050a1a]/70">
                      {selectedService.overview}
                    </p>
                  </div>                  {/* Interactive Cluster Configurator or Blueprint Diagram */}
                  {selectedService.gpu && selectedService.gpu !== "None" ? (
                    <div className="border border-[#2455FF]/15 bg-[#2455FF]/5 rounded-2xl p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#2455FF]/10 pb-2">
                        <span className="font-cine text-[13px] tracking-wider text-[#050a1a] uppercase font-bold">
                          Configure Node Cluster
                        </span>
                        <span className="font-mono text-[9.5px] text-[#2455FF] font-semibold bg-[#2455FF]/8 px-2 py-0.5 rounded">
                          DEPLOYABLE ESTIMATOR
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Control 1: GPU Count */}
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9.5px] uppercase text-slate-500">
                            NVIDIA {selectedService.gpu} Count: <span className="font-sans font-semibold text-[#050a1a]">{gpuCount}x</span>
                          </label>
                          <div className="flex gap-2">
                            {[1, 2, 4, 8].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setGpuCount(num)}
                                className={`flex-1 py-1.5 text-xs font-mono rounded-lg border transition ${
                                  gpuCount === num
                                    ? "bg-[#2455FF] border-[#2455FF] text-white font-bold"
                                    : "bg-white border-[#2455FF]/15 hover:bg-slate-50 text-slate-600"
                                }`}
                              >
                                {num}x
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Control 2: SSD Storage */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between font-mono text-[9.5px] uppercase text-slate-500">
                            <span>NVMe SSD Storage:</span>
                            <span className="font-sans font-semibold text-[#050a1a]">{ssdSize} TB</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="16"
                            step="1"
                            value={ssdSize}
                            onChange={(e) => setSsdSize(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-[#2455FF]/15 rounded-lg appearance-none cursor-pointer accent-[#2455FF] focus:outline-none"
                          />
                          <div className="flex justify-between text-[8.5px] font-mono text-slate-400">
                            <span>1 TB</span>
                            <span>8 TB</span>
                            <span>16 TB</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Visual Blueprint Map */}
                      <div className="bg-[#050a1a]/95 border border-[#2455FF]/20 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[140px]">
                        {/* Blueprint background grid */}
                        <div className="absolute inset-0 bp-grid opacity-20 pointer-events-none" />
                        
                        <div className="relative flex flex-wrap items-center justify-center gap-4 z-10 w-full max-w-[320px]">
                          {/* GPUs map */}
                          <div className="flex flex-wrap items-center justify-center gap-2 max-w-[200px]">
                            {Array.from({ length: gpuCount }).map((_, i) => (
                              <div
                                key={i}
                                className="w-10 h-10 rounded-lg bg-[#2455FF]/10 border border-[#2455FF]/50 flex flex-col items-center justify-center text-white ring-1 ring-[#00E5FF]/20 animate-pulse"
                                style={{ animationDelay: `${i * 150}ms` }}
                              >
                                <span className="font-cine text-[9px] font-bold text-[#00E5FF]">GPU</span>
                                <span className="font-mono text-[7px] text-[#2455FF]/70">#{i+1}</span>
                              </div>
                            ))}
                          </div>

                          {/* Connection line */}
                          <div className="hidden sm:block h-px w-6 bg-gradient-to-r from-[#00E5FF]/40 to-[#2455FF]/40 border-dashed border-t" />

                          {/* Storage Node */}
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-[#2455FF] flex flex-col items-center justify-center text-white relative">
                            <Database className="h-4 w-4 text-[#2455FF]" />
                            <span className="font-mono text-[8px] mt-0.5 text-slate-300">{ssdSize}TB</span>
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2455FF]" />
                            </span>
                          </div>
                        </div>
                        
                        <span className="mt-2 font-mono text-[8.5px] text-[#00E5FF]/70 tracking-widest uppercase z-10 animate-pulse">
                          NODE CONFIGURATION: ACTIVE SYNAPSE CONNECTED
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Default Blueprint Diagram */
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center py-6">
                      <CloudLightning className="h-6 w-6 text-[#2455FF]/50 mb-1.5 animate-pulse" />
                      <span className="font-cine text-[12px] tracking-wider text-[#050a1a]">Isolated Tenant Architecture Diagram</span>
                      <span className="font-mono text-[9px] uppercase text-[#050a1a]/40 tracking-wider">Deployable Node Context</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Key features */}
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#050a1a]/50">Key Features</span>
                      <ul className="mt-1.5 space-y-1.5">
                        {selectedService.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[12.5px] text-[#050a1a]/75 leading-tight">
                            <Check className="h-4 w-4 text-[#2455FF] shrink-0 mt-0.5" strokeWidth={3} />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Specifications */}
                    <div className="space-y-3">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#050a1a]/50 block">Hardware / Engine</span>
                        <span className="font-sans text-[13px] text-[#050a1a]/75">
                          {selectedService.gpu === "None" ? "Enterprise CPU Nodes" : `NVIDIA ${selectedService.gpu} Cores`}
                        </span>
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#050a1a]/50 block">SLA SLA Guaranteed</span>
                        <span className="font-sans text-[13px] text-[#050a1a]/75">{selectedService.sla}</span>
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#050a1a]/50 block">Technologies Stack</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedService.technologies.map((t) => (
                            <span key={t} className="font-mono text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-6 pt-4 border-t border-[#2455FF]/10 flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <span className="font-mono text-[9px] uppercase text-[#050a1a]/40 tracking-wider block">
                    {dynamicPrice ? "Custom Cluster Pricing" : "Price Model"}
                  </span>
                  <span className="font-sans text-[13.5px] font-semibold text-[#2455FF]">
                    {dynamicPrice 
                      ? `$${dynamicPrice.hourly}/hr (Est. $${dynamicPrice.monthly}/mo)`
                      : `${selectedService.pricingModel} (${selectedService.startingPrice})`}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedService(null)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-[13px] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const svc = selectedService;
                      setSelectedService(null);
                      if (dynamicPrice) {
                        toast.success(`Request submitted for ${svc.name}!`, {
                          description: `Config: ${gpuCount}x GPU, ${ssdSize}TB storage. Our infrastructure team will contact you in 12 hours.`,
                          duration: 6000
                        });
                      } else {
                        handleRequestService(svc);
                      }
                    }}
                    className="group px-4 py-2 bg-[#2455FF] hover:bg-[#1a44e0] text-white rounded-xl font-semibold text-[13px] transition flex items-center gap-1.5"
                  >
                    <span>Request Deploy</span>
                    <CloudLightning className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-out Mobile Filters Drawer */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex justify-end bg-[#050a1a]/40 backdrop-blur-sm lg:hidden"
          >
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              aria-label="Close filters"
              className="absolute inset-0 cursor-default outline-none bg-transparent border-0"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-full max-w-[280px] bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-cine text-[18px] tracking-wide text-[#050a1a] flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-[#2455FF]" />
                    <span>Filters</span>
                  </h3>
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#050a1a]/40 block mb-2">Category</span>
                    <div className="space-y-1">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsFilterDrawerOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-[13px] font-medium transition ${
                            selectedCategory === cat
                              ? "bg-[#2455FF]/8 text-[#2455FF]"
                              : "text-[#050a1a]/60 hover:bg-[#050a1a]/5"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deployment Filter */}
                  <div>
                    <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#050a1a]/40 block mb-2">Deployment</span>
                    <div className="space-y-1">
                      {DEPLOYMENT_TYPES.map((dt) => (
                        <button
                          key={dt}
                          onClick={() => {
                            setSelectedDeployType(dt);
                            setIsFilterDrawerOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-[13px] font-medium transition ${
                            selectedDeployType === dt
                              ? "bg-[#2455FF]/8 text-[#2455FF]"
                              : "text-[#050a1a]/60 hover:bg-[#050a1a]/5"
                          }`}
                        >
                          {dt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Region Filter */}
                  <div>
                    <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#050a1a]/40 block mb-2">Region</span>
                    <div className="space-y-1">
                      {REGIONS.map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            setSelectedRegion(r);
                            setIsFilterDrawerOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-[13px] font-medium transition ${
                            selectedRegion === r
                              ? "bg-[#2455FF]/8 text-[#2455FF]"
                              : "text-[#050a1a]/60 hover:bg-[#050a1a]/5"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* GPU Filter */}
                  <div>
                    <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#050a1a]/40 block mb-2">GPU Class</span>
                    <div className="space-y-1">
                      {GPUS.map((g) => (
                        <button
                          key={g}
                          onClick={() => {
                            setSelectedGPU(g);
                            setIsFilterDrawerOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-[13px] font-medium transition ${
                            selectedGPU === g
                              ? "bg-[#2455FF]/8 text-[#2455FF]"
                              : "text-[#050a1a]/60 hover:bg-[#050a1a]/5"
                          }`}
                        >
                          {g === "None" ? "CPU Only" : g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedDeployType("All");
                    setSelectedRegion("All");
                    setSelectedGPU("All");
                    setIsFilterDrawerOpen(false);
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-[13px] transition"
                >
                  Reset All Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
