<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { useRoute, useRouter } from 'vue-router'
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { getApiErrorMessage } from '@/services/api/http'
import { loginSchema, type LoginValues } from '@/validators/auth'

const auth = useAuthStore(); const route = useRoute(); const router = useRouter()
const showPassword = ref(false); const apiError = ref(''); const expired = route.query.expired === '1'
const { defineField, handleSubmit, errors, isSubmitting, setErrors } = useForm<LoginValues>({ initialValues: { email: '', password: '' } })
const [email, emailAttrs] = defineField('email'); const [password, passwordAttrs] = defineField('password')
const submit = handleSubmit(async (values) => {
  apiError.value = ''
  const validation = loginSchema.safeParse(values)
  if (!validation.success) {
    setErrors(Object.fromEntries(validation.error.issues.map((issue) => [String(issue.path[0]), issue.message])) as Partial<Record<keyof LoginValues, string>>)
    return
  }
  try {
    await auth.login(validation.data.email, validation.data.password)
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/app') ? route.query.redirect : '/app/dashboard'
    await router.replace(redirect)
  } catch (error) { apiError.value = getApiErrorMessage(error, 'Email atau kata sandi belum dapat diverifikasi.') }
})
</script>

<template>
  <div class="grid min-h-screen bg-white lg:grid-cols-[minmax(440px,1fr)_minmax(480px,.92fr)]">
    <section class="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-sky-300 via-blue-300 to-blue-100 p-8 text-navy-950 lg:flex lg:flex-col lg:justify-between xl:p-12">
      <div class="absolute inset-y-0 right-0 w-[38%] bg-gradient-to-br from-blue-500/20 to-blue-700/20" style="clip-path: polygon(45% 0, 100% 0, 100% 100%, 0 100%)" />
      <img src="/korpri%20pura%20raharja.webp" alt="Gedung RS Korpri Pura Raharja" class="absolute inset-x-0 bottom-0 h-[51%] w-full object-cover object-center [mask-image:linear-gradient(to_bottom,transparent_0%,black_22%)]" />
      <div class="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-blue-950/25 via-blue-900/5 to-transparent" />
      <div class="relative z-10 flex items-center gap-4"><div class="grid size-[68px] place-items-center rounded-2xl bg-white p-1.5 shadow-sm"><img src="/Logo%20Pura.png" alt="Logo RS Korpri Pura Raharja" class="h-full w-full object-contain" /></div><div><p class="text-[15px] font-extrabold tracking-wide text-navy-950">RS KORPRI</p><p class="text-[13px] font-semibold text-navy-900">PURA RAHARJA</p></div></div>
      <div class="absolute left-8 right-8 top-[18%] z-10 max-w-md xl:left-12"><h1 class="text-2xl font-bold leading-tight tracking-tight text-navy-950 xl:text-[30px]">Bersama Mewujudkan Pelayanan Kesehatan Terbaik</h1><div class="mt-4 inline-flex max-w-full items-center gap-4 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-lg shadow-blue-900/10 backdrop-blur-md"><span class="grid size-14 shrink-0 place-items-center rounded-xl bg-blue-600 text-xl font-black tracking-wide text-white shadow-sm">SPI</span><div class="min-w-0"><p class="text-sm font-extrabold leading-snug text-navy-950 sm:text-base xl:text-lg">Satuan Pemeriksaan Internal</p><p class="mt-1 text-xs font-medium text-slate-600">RS Korpri Pura Raharja</p></div></div><div class="mt-4 flex items-center gap-2 text-[11px] font-medium text-navy-950"><Sparkles class="size-3.5 shrink-0" />Mendukung tata kelola dan peningkatan mutu rumah sakit</div></div>
      <div class="relative z-10 flex items-center justify-between text-[10px] text-navy-950/55"><span>© {{ new Date().getFullYear() }} RS Korpri Pura Raharja</span><span>Satuan Pemeriksaan Internal</span></div>
    </section>

    <section class="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
      <div class="w-full max-w-[420px]">
        <div class="mb-8 flex items-center gap-3 lg:hidden"><div class="grid size-14 place-items-center rounded-xl bg-white p-1 shadow-sm"><img src="/Logo%20Pura.png" alt="Logo RS Korpri Pura Raharja" class="h-full w-full object-contain" /></div><div><p class="text-sm font-extrabold text-navy-950">RS KORPRI PURA RAHARJA</p><p class="mt-0.5 text-xs font-bold text-blue-700">SPI · Satuan Pemeriksaan Internal</p></div></div>
        <div class="mb-8"><p class="text-xs font-bold uppercase tracking-[.16em] text-blue-600">Selamat datang</p><h2 class="mt-2 text-[28px] font-bold tracking-tight text-navy-950">Masuk ke akun Anda</h2><p class="mt-2 text-sm leading-6 text-slate-500">Masuk ke akun Anda untuk melanjutkan.</p></div>
        <div v-if="expired" class="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">Sesi berakhir. Silakan masuk kembali untuk melanjutkan.</div>
        <div v-if="apiError" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700" role="alert">{{ apiError }}</div>
        <form class="space-y-5" @submit.prevent="submit">
          <div><label for="email" class="mb-2 block text-xs font-semibold text-slate-700">Email</label><div class="relative"><Mail class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input id="email" v-model="email" v-bind="emailAttrs" type="email" autocomplete="username" placeholder="nama@rumahsakit.id" class="h-12 w-full rounded-xl border bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" :class="errors.email ? 'border-red-400' : 'border-slate-200'" /><p v-if="errors.email" class="mt-1.5 text-xs text-red-600">{{ errors.email }}</p></div></div>
          <div><div class="mb-2 flex items-center justify-between"><label for="password" class="text-xs font-semibold text-slate-700">Kata sandi</label><span class="text-[11px] text-slate-400">Hubungi administrator jika lupa</span></div><div class="relative"><LockKeyhole class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input id="password" v-model="password" v-bind="passwordAttrs" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="Masukkan kata sandi" class="h-12 w-full rounded-xl border bg-white pl-10 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" :class="errors.password ? 'border-red-400' : 'border-slate-200'" /><button type="button" class="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'" @click="showPassword = !showPassword"><EyeOff v-if="showPassword" class="size-4" /><Eye v-else class="size-4" /></button></div><p v-if="errors.password" class="mt-1.5 text-xs text-red-600">{{ errors.password }}</p></div>
          <BaseButton type="submit" size="lg" class="w-full" :disabled="isSubmitting"><span v-if="isSubmitting" class="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />{{ isSubmitting ? 'Memverifikasi…' : 'Masuk' }}</BaseButton>
        </form>
        <p class="mt-5 text-center text-[10px] text-slate-500">Belum punya akses? Hubungi Administrator.</p>
        <div class="mt-7 flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4"><ShieldCheck class="mt-0.5 size-4 shrink-0 text-teal-600" /><p class="text-[11px] leading-5 text-slate-500">Akses ini khusus untuk pengguna berwenang. Aktivitas pada sistem dapat dicatat untuk keperluan audit.</p></div>
        <p class="mt-8 text-center text-[10px] text-slate-400">RS Korpri Pura Raharja <span class="mx-1">·</span> Satuan Pemeriksaan Internal</p>
      </div>
    </section>
  </div>
</template>
