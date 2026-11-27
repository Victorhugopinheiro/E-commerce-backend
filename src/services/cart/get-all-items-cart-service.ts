import userModel from "../../model/userModel";
import { Shopper } from "../../types/shopper";
import {
  GuestCartUnavailableError,
  openGuestCart,
  writeGuestCart,
} from "../guest/guest-cart-store";
import { presentStoredLines } from "./present-cart-lines";

class GetAllItemsCartService {
  async execute(shopper: Shopper) {
    try {
      if (shopper.kind === "guest") {
        return await this.listGuest(shopper);
      }

      const user = await userModel.findById(shopper.userId);

      if (!user) {
        return { success: false, message: "Usuário não encontrado" };
      }

      const rawCart = user.cartData;
      const storedItems: unknown[] = Array.isArray(rawCart) ? rawCart : [];
      const { kept, cart } = await presentStoredLines(storedItems);

      if (kept.length !== storedItems.length) {
        await userModel.findByIdAndUpdate(shopper.userId, { cartData: kept });
      }

      return { success: true, cart };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Erro no servidor", err };
    }
  }

  private async listGuest(shopper: Extract<Shopper, { kind: "guest" }>) {
    try {
      const opened = await openGuestCart(
        shopper.guestId,
        shopper.cookieExisted
      );
      const { kept, cart } = await presentStoredLines(opened.lines);

      if (kept.length !== opened.lines.length) {
        await writeGuestCart(opened.guestId, kept as typeof opened.lines);
      }

      return { success: true, cart, guestId: opened.guestId };
    } catch (err) {
      if (err instanceof GuestCartUnavailableError) {
        return {
          success: false,
          unavailable: true,
          message: err.message,
        };
      }
      throw err;
    }
  }
}

export default GetAllItemsCartService;
