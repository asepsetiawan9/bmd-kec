<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FileController extends Controller
{
    /**
     * Stream storage files with whitelist folder guard.
     */
    public function streamStorageFile(string $folder, string $filename): BinaryFileResponse
    {
        $allowedFolders = ['aset_foto', 'aset_fotos', 'aset_dokumen', 'aset_dokumens', 'qr_codes'];

        if (!in_array($folder, $allowedFolders, true)) {
            abort(403, 'Akses folder tidak diizinkan.');
        }

        // Prevent directory traversal
        $cleanedFilename = basename($filename);
        $path = $folder . '/' . $cleanedFilename;

        if (Storage::disk('public')->exists($path)) {
            return response()->file(Storage::disk('public')->path($path));
        }

        if (Storage::disk('local')->exists($path)) {
            return response()->file(Storage::disk('local')->path($path));
        }

        abort(404, 'Berkas tidak ditemukan.');
    }
}
