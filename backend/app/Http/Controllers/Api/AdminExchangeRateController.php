<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreExchangeRateRequest;
use App\Http\Resources\ExchangeRateResource;
use App\Models\AuditLog;
use App\Models\Currency;
use App\Models\ExchangeRate;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminExchangeRateController extends Controller
{
    /**
     * GET /api/admin/exchange-rates
     */
    public function index(Request $request): JsonResponse
    {
        $rates = ExchangeRate::with(['baseCurrency', 'quoteCurrency'])->get();

        return ApiResponse::success(ExchangeRateResource::collection($rates));
    }

    /**
     * POST /api/admin/exchange-rates
     */
    public function store(StoreExchangeRateRequest $request): JsonResponse
    {
        $base = Currency::where('code', $request->input('base_currency_code'))->firstOrFail();
        $quote = Currency::where('code', $request->input('quote_currency_code'))->firstOrFail();

        $rate = ExchangeRate::updateOrCreate(
            ['base_currency_id' => $base->id, 'quote_currency_id' => $quote->id],
            [
                'rate' => (string) $request->input('rate'),
                'spread_percentage' => (string) $request->input('spread_percentage', '0.0020'),
                'is_fixed' => $request->boolean('is_fixed', false),
                'effective_at' => now(),
            ]
        );

        AuditLog::create([
            'actor_id' => $request->user()->id,
            'actor_name' => $request->user()->name,
            'action' => 'EXCHANGE_RATE_UPSERTED',
            'entity' => 'ExchangeRate',
            'entity_id' => (string) $rate->id,
            'metadata' => ['pair' => "{$base->code}/{$quote->code}", 'rate' => $rate->rate],
            'created_at' => now(),
        ]);

        return ApiResponse::success(
            new ExchangeRateResource($rate->fresh(['baseCurrency', 'quoteCurrency'])),
            'Taux de change enregistré avec succès',
            201
        );
    }

    /**
     * PATCH /api/admin/exchange-rates/{id}
     */
    public function update(Request $request, int|string $id): JsonResponse
    {
        $rate = ExchangeRate::findOrFail($id);

        if ($request->filled('rate')) {
            $rate->rate = (string) $request->input('rate');
        }
        if ($request->filled('spread_percentage')) {
            $rate->spread_percentage = (string) $request->input('spread_percentage');
        }
        if ($request->has('is_fixed')) {
            $rate->is_fixed = $request->boolean('is_fixed');
        }
        $rate->effective_at = now();
        $rate->save();

        AuditLog::create([
            'actor_id' => $request->user()->id,
            'actor_name' => $request->user()->name,
            'action' => 'EXCHANGE_RATE_UPDATED',
            'entity' => 'ExchangeRate',
            'entity_id' => (string) $rate->id,
            'metadata' => ['rate' => $rate->rate],
            'created_at' => now(),
        ]);

        return ApiResponse::success(new ExchangeRateResource($rate->load(['baseCurrency', 'quoteCurrency'])));
    }
}
