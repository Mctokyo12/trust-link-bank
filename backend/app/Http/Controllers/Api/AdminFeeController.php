<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFeeRequest;
use App\Models\AuditLog;
use App\Models\Currency;
use App\Models\Fee;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminFeeController extends Controller
{
    /**
     * GET /api/admin/fees
     */
    public function index(Request $request): JsonResponse
    {
        $fees = Fee::with('currency')->get();

        return ApiResponse::success($fees);
    }

    /**
     * POST /api/admin/fees
     */
    public function store(StoreFeeRequest $request): JsonResponse
    {
        $currency = Currency::where('code', $request->input('currency_code'))->firstOrFail();

        $fee = Fee::updateOrCreate(
            ['type' => $request->input('type'), 'currency_id' => $currency->id],
            [
                'fixed_amount' => (string) $request->input('fixed_amount'),
                'percentage' => (string) $request->input('percentage'),
                'min_fee' => $request->filled('min_fee') ? (string) $request->input('min_fee') : null,
                'max_fee' => $request->filled('max_fee') ? (string) $request->input('max_fee') : null,
            ]
        );

        AuditLog::create([
            'actor_id' => $request->user()->id,
            'actor_name' => $request->user()->name,
            'action' => 'FEE_SCHEDULE_UPDATED',
            'entity' => 'Fee',
            'entity_id' => (string) $fee->id,
            'metadata' => ['type' => $fee->type, 'currency' => $currency->code],
            'created_at' => now(),
        ]);

        return ApiResponse::success($fee->load('currency'), 'Grille tarifaire mise à jour', 201);
    }

    /**
     * PATCH /api/admin/fees/{id}
     */
    public function update(Request $request, int|string $id): JsonResponse
    {
        $fee = Fee::findOrFail($id);

        if ($request->filled('fixed_amount')) {
            $fee->fixed_amount = (string) $request->input('fixed_amount');
        }
        if ($request->filled('percentage')) {
            $fee->percentage = (string) $request->input('percentage');
        }
        if ($request->filled('min_fee')) {
            $fee->min_fee = (string) $request->input('min_fee');
        }
        if ($request->filled('max_fee')) {
            $fee->max_fee = (string) $request->input('max_fee');
        }
        $fee->save();

        return ApiResponse::success($fee->load('currency'), 'Frais mis à jour avec succès');
    }
}
