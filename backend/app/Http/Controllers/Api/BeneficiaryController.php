<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBeneficiaryRequest;
use App\Http\Resources\BeneficiaryResource;
use App\Models\Beneficiary;
use App\Models\Currency;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BeneficiaryController extends Controller
{
    /**
     * GET /api/beneficiaries
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $beneficiaries = Beneficiary::with('currency')
            ->where('user_id', $user->id)
            ->orderBy('is_favorite', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return ApiResponse::success(BeneficiaryResource::collection($beneficiaries));
    }

    /**
     * POST /api/beneficiaries
     */
    public function store(StoreBeneficiaryRequest $request): JsonResponse
    {
        $user = $request->user();
        $currency = Currency::where('code', $request->input('currency_code'))->firstOrFail();

        $beneficiaryUser = null;
        if (in_array($request->input('channel'), ['trustlink', 'novapay'])) {
            $identifier = $request->input('identifier');
            $cleanTag = ltrim($identifier, '@');
            $beneficiaryUser = User::where('novatag', '@' . $cleanTag)
                ->orWhere('phone', $identifier)
                ->orWhere('email', $identifier)
                ->first();
        }

        $beneficiary = Beneficiary::create([
            'user_id' => $user->id,
            'beneficiary_user_id' => $beneficiaryUser?->id,
            'alias' => $request->input('alias'),
            'full_name' => $request->input('full_name'),
            'channel' => $request->input('channel'),
            'provider' => $request->input('provider'),
            'identifier' => $request->input('identifier'),
            'currency_id' => $currency->id,
            'is_favorite' => $request->boolean('is_favorite', false),
        ]);

        return ApiResponse::success(
            new BeneficiaryResource($beneficiary->load('currency')),
            'Bénéficiaire enregistré avec succès',
            201
        );
    }

    /**
     * DELETE /api/beneficiaries/{id}
     */
    public function destroy(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $beneficiary = Beneficiary::where('user_id', $user->id)->where('id', $id)->first();

        if (!$beneficiary) {
            return ApiResponse::error(
                code: 'BENEFICIARY_NOT_FOUND',
                message: 'Bénéficiaire introuvable.',
                status: 404
            );
        }

        $beneficiary->delete();

        return ApiResponse::success(null, 'Bénéficiaire supprimé avec succès');
    }
}
