<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\AksiRiwayatAset;
use App\Enums\JenisDokumenAset;
use App\Models\Aset;
use App\Models\AsetDokumen;
use App\Services\RiwayatAsetService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AsetDokumenController extends Controller
{
    public function __construct(
        protected RiwayatAsetService $riwayatAsetService
    ) {}

    public function store(Request $request, Aset $aset): RedirectResponse
    {
        Gate::authorize('update', $aset);

        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'jenis' => ['required', 'string', 'in:foto,sertifikat,bpkb,stnk,bast,faktur,kontrak,lainnya'],
            'nama_dokumen' => ['required', 'string', 'max:255'],
            'nomor_dokumen' => ['nullable', 'string', 'max:100'],
        ], [
            'file.required' => 'Berkas dokumen wajib diunggah.',
            'file.mimes' => 'Format berkas hanya diperbolehkan PDF, JPG, JPEG, atau PNG.',
            'file.max' => 'Ukuran berkas maksimal 5 MB.',
            'jenis.required' => 'Jenis dokumen wajib dipilih.',
            'nama_dokumen.required' => 'Nama dokumen wajib diisi.',
        ]);

        $file = $request->file('file');
        $jenisEnum = JenisDokumenAset::from($validated['jenis']);
        $disk = $jenisEnum->disk();

        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $safeName = 'dok_' . time() . '_' . uniqid() . '.' . $extension;
        $folder = $disk === 'public' ? 'aset_fotos' : 'aset_dokumen';

        $storedPath = $file->storeAs($folder, $safeName, $disk);

        $dokumen = AsetDokumen::create([
            'aset_id' => $aset->id,
            'jenis' => $jenisEnum,
            'nama_dokumen' => $validated['nama_dokumen'],
            'disk' => $disk,
            'file_path' => $storedPath,
            'file_name' => $originalName,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'nomor_dokumen' => $validated['nomor_dokumen'] ?? null,
            'uploaded_by' => Auth::id(),
        ]);

        // If it's a photo and aset has no primary photo yet, set it as primary photo
        if ($jenisEnum === JenisDokumenAset::FOTO && ! $aset->foto_path) {
            $aset->updateQuietly(['foto_path' => $storedPath]);
        }

        $this->riwayatAsetService->catat(
            asetId: (int) $aset->id,
            aksi: AksiRiwayatAset::UPLOAD_DOKUMEN,
            keterangan: "Mengunggah dokumen legalitas '{$validated['nama_dokumen']}' ({$jenisEnum->label()}).",
            dataSesudah: ['dokumen_id' => $dokumen->id, 'nama' => $validated['nama_dokumen']]
        );

        return redirect()->back()->with('success', "Dokumen '{$validated['nama_dokumen']}' berhasil diunggah.");
    }

    public function download(Aset $aset, AsetDokumen $dokumen): StreamedResponse
    {
        Gate::authorize('view', $aset);

        abort_if($dokumen->aset_id !== $aset->id, 404, 'Dokumen tidak sesuai dengan aset terkait.');

        // Proteksi dokumen sensitif (hukum, BPKB, Sertifikat)
        if ($dokumen->jenis !== JenisDokumenAset::FOTO) {
            Gate::authorize('viewSensitiveDocuments', $aset);
        }

        abort_if(! Storage::disk($dokumen->disk)->exists($dokumen->file_path), 404, 'File fisik tidak ditemukan di penyimpanan server.');

        return Storage::disk($dokumen->disk)->download($dokumen->file_path, $dokumen->file_name);
    }

    public function destroy(Aset $aset, AsetDokumen $dokumen): RedirectResponse
    {
        Gate::authorize('update', $aset);

        abort_if($dokumen->aset_id !== $aset->id, 404, 'Dokumen tidak sesuai dengan aset terkait.');

        if (Storage::disk($dokumen->disk)->exists($dokumen->file_path)) {
            Storage::disk($dokumen->disk)->delete($dokumen->file_path);
        }

        $namaDokumen = $dokumen->nama_dokumen;
        $dokumen->delete();

        $this->riwayatAsetService->catat(
            asetId: (int) $aset->id,
            aksi: AksiRiwayatAset::HAPUS_DOKUMEN,
            keterangan: "Menghapus dokumen '{$namaDokumen}'.",
            dataSebelum: ['nama' => $namaDokumen]
        );

        return redirect()->back()->with('success', "Dokumen '{$namaDokumen}' berhasil dihapus.");
    }
}
