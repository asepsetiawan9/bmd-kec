<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Aset;
use App\Models\User;

class AsetPolicy
{
    /**
     * Determine whether the user can view any assets.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('aset.view');
    }

    /**
     * Determine whether the user can view the specific asset.
     */
    public function view(User $user, Aset $aset): bool
    {
        return $user->can('aset.view');
    }

    /**
     * Determine whether the user can create an asset.
     */
    public function create(User $user): bool
    {
        return $user->can('aset.create');
    }

    /**
     * Determine whether the user can update the asset.
     */
    public function update(User $user, Aset $aset): bool
    {
        return $user->can('aset.update');
    }

    /**
     * Determine whether the user can delete the asset directly.
     * Penghapusan hanya via usulan penghapusan resmi berjenjang.
     */
    public function delete(User $user, Aset $aset): bool
    {
        return false;
    }

    /**
     * Determine whether the user can print asset label QR.
     */
    public function printLabel(User $user): bool
    {
        return $user->can('aset.label.print');
    }

    /**
     * Determine whether the user can view sensitive documents (BPKB, Sertifikat).
     */
    public function viewSensitiveDocuments(User $user): bool
    {
        return $user->can('aset.dokumen.view-sensitive');
    }
}
