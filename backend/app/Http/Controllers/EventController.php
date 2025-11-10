<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * Get all events for a branch, optionally filtered by user
     * GET /api/events?branch_id=1&user_id=1
     */
    public function index(Request $request)
    {
        $branchId = $request->query('branch_id');
        $userId = $request->query('user_id');

        if (!$branchId) {
            return response()->json([
                'error' => 'branch_id is required',
            ], 400);
        }

        $query = Event::where('branch_id', $branchId)
            ->with('organizer', 'room', 'participants');

        // If user_id is provided, filter events where user is organizer or participant
        if ($userId) {
            $query->where(function ($q) use ($userId) {
                $q->where('organizer_id', $userId)
                  ->orWhereHas('participants', function ($subQuery) use ($userId) {
                      $subQuery->where('user_id', $userId);
                  });
            });
        }

        $events = $query->orderBy('start_time')->get();

        return response()->json([
            'success' => true,
            'data' => $events,
        ]);
    }

    /**
     * Create a new event
     * POST /api/events
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|integer|exists:branches,branch_id',
            'organizer_id' => 'required|integer|exists:users,id',
            'room_id' => 'required|integer|exists:rooms,room_id',
            'start_time' => 'required|date_format:Y-m-d H:i:s',
            'end_time' => 'required|date_format:Y-m-d H:i:s|after:start_time',
            'memo' => 'nullable|string|max:150',
        ]);

        $event = Event::create($validated);
        $event->load('organizer', 'room', 'participants');

        return response()->json([
            'success' => true,
            'data' => $event,
        ], 201);
    }

    /**
     * Get a specific event
     * GET /api/events/{id}
     */
    public function show($id)
    {
        $event = Event::with('organizer', 'room', 'participants')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $event,
        ]);
    }

    /**
     * Update an event
     * PUT /api/events/{id}
     */
    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'room_id' => 'sometimes|integer|exists:rooms,room_id',
            'start_time' => 'sometimes|date_format:Y-m-d H:i:s',
            'end_time' => 'sometimes|date_format:Y-m-d H:i:s',
            'memo' => 'nullable|string|max:150',
        ]);

        // Validate that end_time is after start_time if both are provided
        if (isset($validated['start_time']) && isset($validated['end_time'])) {
            if ($validated['end_time'] <= $validated['start_time']) {
                return response()->json([
                    'error' => 'end_time must be after start_time',
                ], 422);
            }
        }

        $event->update($validated);
        $event->load('organizer', 'room', 'participants');

        return response()->json([
            'success' => true,
            'data' => $event,
        ]);
    }

    /**
     * Delete an event
     * DELETE /api/events/{id}
     */
    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event deleted successfully',
        ]);
    }
}
