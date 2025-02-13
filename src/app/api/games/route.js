import { NextResponse } from "next/server";
import Game from "@/models/Game";
import { checkRole, checkBranch } from "@/middleware/auth";

export async function POST(req) {
  await checkRole(["SuperAdmin", "Admin"])(req, res, async () => {
    await checkBranch(req, res, async () => {
      try {
        const game = new Game(req.body);
        await game.save();
        return NextResponse.json(
          { message: "Game created successfully", output: game },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    });
  });
}

export async function GET(req) {
  await checkRole(["SuperAdmin", "Admin", "StoreManager", "Staff"])(req, res, async () => {
    await checkBranch(req, res, async () => {
      try {
        const games = await Game.find({ branch: req.query.branch });
        return NextResponse.json(
          { message: "Games fetched successfully", output: games },
          { status: 200 }
        );
      } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    });
  });
}

export async function PATCH(req) {
  await checkRole(["SuperAdmin", "Admin"])(req, res, async () => {
    await checkBranch(req, res, async () => {
      try {
        const { id, ...updates } = req.body;

        if (!id) {
          return NextResponse.json(
            { message: "Game ID is required" },
            { status: 400 }
          );
        }

        const updatedGame = await Game.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedGame) {
          return NextResponse.json({ message: "Game not found" }, { status: 404 });
        }

        return NextResponse.json(
          { message: "Game updated successfully", output: updatedGame },
          { status: 200 }
        );
      } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    });
  });
}

export async function DELETE(req) {
  await checkRole(["SuperAdmin", "Admin"])(req, res, async () => {
    await checkBranch(req, res, async () => {
      try {
        const { id } = req.body;

        if (!id) {
          return NextResponse.json(
            { message: "Game ID is required" },
            { status: 400 }
          );
        }

        const deletedGame = await Game.findByIdAndDelete(id);

        if (!deletedGame) {
          return NextResponse.json({ message: "Game not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Game deleted successfully" }, { status: 200 });
      } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    });
  });
}
