<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { Bell, ChevronDown, ClipboardCheck, FileCheck2, FileSearch, FileText, HelpCircle, LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, X } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import type { Role } from '@/types/api'
import ToastHost from '@/components/ui/ToastHost.vue'

const route = useRoute(); const router = useRouter(); const auth = useAuthStore(); const drawerOpen = ref(false); const profileOpen = ref(false)
const unreadQuery = useQuery({ queryKey: ['notification-unread-count'], queryFn: api.unreadNotificationCount, enabled: computed(() => Boolean(auth.user)), refetchInterval: 30_000, refetchOnWindowFocus: true })
const unreadCount = computed(() => unreadQuery.data.value?.count || 0)
const unreadLabel = computed(() => unreadCount.value > 99 ? '99+' : String(unreadCount.value))
const navItems = [
  { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard },
  { label: 'OCR Dokumen', to: '/app/ocr', icon: FileSearch },
  { label: 'Manajemen Dokumen', to: '/app/documents', icon: FileText },
  { label: 'Penugasan SPI', to: '/app/tasks', icon: ClipboardCheck },
  { label: 'Laporan & Evaluasi', to: '/app/reports', icon: ShieldCheck },
  { label: 'Memo & Tindak Lanjut', to: '/app/memos', icon: FileCheck2 },
  { label: 'Notifikasi', to: '/app/notifications', icon: Bell },
  { label: 'Pengaturan', to: '/app/settings', icon: Settings },
  { label: 'Panduan', to: '/app/guide', icon: HelpCircle },
]
const visibleNav = computed(() => navItems)
const roleLabel = computed(() => ({ ADMIN_SPI: 'Admin SPI', ANGGOTA_SPI: 'Anggota SPI', PIMPINAN_SPI: 'Pimpinan SPI' }[auth.user?.role as Role] || 'Pengguna'))
const initial = computed(() => auth.user?.name?.trim().split(/\s+/).slice(0, 2).map((s) => s[0]).join('').toUpperCase() || 'SP')
async function signOut() { await auth.logout(); router.push('/login') }
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div v-if="drawerOpen" class="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden" @click="drawerOpen = false" />
    <aside class="fixed inset-y-0 left-0 z-50 flex w-[258px] -translate-x-full flex-col bg-navy-950 text-white shadow-2xl transition-transform duration-200 lg:translate-x-0" :class="drawerOpen ? 'translate-x-0' : ''">
      <div class="flex h-[88px] items-center gap-3 border-b border-white/10 px-5">
        <div class="grid size-[58px] shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-1"><img src="/Logo%20Pura.png" alt="Logo RS Korpri Pura Raharja" class="h-full w-full object-contain" /></div>
        <div class="min-w-0"><p class="text-[12px] font-extrabold leading-4 tracking-wide">RS KORPRI</p><p class="text-[11px] font-medium text-blue-100/80">PURA RAHARJA</p><p class="mt-1 text-[9px] uppercase tracking-[.18em] text-teal-300">Sistem SPI</p></div>
        <button class="ml-auto rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden" aria-label="Tutup menu" @click="drawerOpen = false"><X class="size-4" /></button>
      </div>
      <div class="px-4 pb-2 pt-6"><p class="px-3 text-[10px] font-bold uppercase tracking-[.16em] text-blue-200/50">Menu utama</p></div>
      <nav class="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        <RouterLink v-for="item in visibleNav" :key="item.to" :to="item.to" class="group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition" :class="route.path === item.to || (item.to === '/app/reports' && route.path.startsWith('/app/reports/')) || (item.to === '/app/memos' && route.path.startsWith('/app/memos/')) ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/20' : 'text-blue-100/70 hover:bg-white/[.07] hover:text-white'" @click="drawerOpen = false">
          <component :is="item.icon" class="size-[17px] shrink-0" :stroke-width="1.8" /><span>{{ item.label }}</span><span v-if="item.to === '/app/reports'" class="ml-auto size-1.5 rounded-full bg-teal-400" /><span v-if="item.to === '/app/notifications' && unreadCount" class="ml-auto min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold leading-4 text-white shadow-sm" :aria-label="`${unreadCount} notifikasi belum dibaca`">{{ unreadLabel }}</span>
        </RouterLink>
        <RouterLink to="/app/templates" class="group flex items-center gap-3 rounded-xl px-3 py-2.5 pl-10 text-xs font-medium text-blue-100/55 hover:bg-white/[.07] hover:text-white" @click="drawerOpen = false"><span>Template laporan</span></RouterLink>
      </nav>
      <div class="border-t border-white/10 p-3">
        <div class="flex items-center gap-3 rounded-xl bg-white/[.07] p-3"><div class="grid size-9 shrink-0 place-items-center rounded-full bg-teal-400/15 text-xs font-bold text-teal-200">{{ initial }}</div><div class="min-w-0 flex-1"><p class="truncate text-xs font-semibold">{{ auth.user?.name || 'Pengguna SPI' }}</p><p class="mt-0.5 text-[10px] text-blue-100/55">{{ roleLabel }}</p></div><ChevronDown class="size-4 text-blue-100/40" /></div>
        <button class="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-blue-100/65 transition hover:bg-white/[.07] hover:text-white" @click="signOut"><LogOut class="size-4" />Keluar</button>
      </div>
    </aside>
    <div class="min-h-screen lg:pl-[258px]">
      <header class="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div class="flex items-center gap-3"><button class="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden" aria-label="Buka menu" @click="drawerOpen = true"><Menu class="size-4" /></button><div class="hidden text-xs text-slate-400 sm:block">RS Korpri Pura Raharja <span class="mx-2">/</span><span class="font-semibold text-slate-700">{{ route.meta.title || 'Sistem SPI' }}</span></div><h1 class="text-sm font-bold text-slate-800 sm:hidden">{{ route.meta.title || 'Sistem SPI' }}</h1></div>
        <div class="flex items-center gap-2 sm:gap-4">
          <RouterLink to="/app/notifications" class="relative grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Notifikasi"><Bell class="size-[18px]" /><span v-if="unreadCount" class="absolute right-0 top-0 grid min-h-[17px] min-w-[17px] place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">{{ unreadLabel }}</span></RouterLink>
          <div class="h-8 w-px bg-slate-200" />
          <div class="relative"><button class="flex items-center gap-2.5 rounded-xl p-1.5 pr-2 text-left hover:bg-slate-50" @click="profileOpen = !profileOpen"><div class="grid size-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{{ initial }}</div><div class="hidden sm:block"><p class="max-w-36 truncate text-xs font-semibold text-slate-800">{{ auth.user?.name }}</p><p class="mt-0.5 text-[10px] text-slate-500">{{ roleLabel }}</p></div><ChevronDown class="hidden size-3.5 text-slate-400 sm:block" /></button><div v-if="profileOpen" class="absolute right-0 top-12 z-40 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"><RouterLink to="/app/settings" class="block rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-50" @click="profileOpen=false">Pengaturan profil</RouterLink><button class="block w-full rounded-lg px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50" @click="profileOpen=false; signOut()">Keluar</button></div></div>
        </div>
      </header>
      <main class="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8"><RouterView v-slot="{ Component }"><Transition name="page" mode="out-in"><component :is="Component" /></Transition></RouterView></main>
    </div>
    <ToastHost />
  </div>
</template>
