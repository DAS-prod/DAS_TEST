import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createServiceSupabase,
} from "../../../../lib/supabase-server";

export const dynamic =
  "force-dynamic";

function normalizeIndianPhone(
  value: unknown
) {
  const raw =
    String(
      value || ""
    ).trim();

  const compact =
    raw.replace(
      /[\s()-]/g,
      ""
    );

  if (
    /^\+\d{10,15}$/.test(
      compact
    )
  ) {
    return compact;
  }

  const digits =
    compact.replace(
      /\D/g,
      ""
    );

  if (
    /^\d{10}$/.test(
      digits
    )
  ) {
    return `+91${digits}`;
  }

  if (
    /^91\d{10}$/.test(
      digits
    )
  ) {
    return `+${digits}`;
  }

  return "";
}

function validEmail(
  value: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const fullName =
      String(
        body.fullName ||
          ""
      )
        .trim()
        .slice(
          0,
          100
        );

    const password =
      String(
        body.password ||
          ""
      );

    const rawIdentifier =
      String(
        body.identifier ||
          body.email ||
          body.phone ||
          ""
      ).trim();

    const isEmail =
      rawIdentifier.includes(
        "@"
      );

    const email =
      isEmail
        ? rawIdentifier.toLowerCase()
        : "";

    const phone =
      isEmail
        ? ""
        : normalizeIndianPhone(
            rawIdentifier
          );

    if (
      fullName.length <
      2
    ) {
      return NextResponse.json(
        {
          error:
            "Enter your full name.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !rawIdentifier
    ) {
      return NextResponse.json(
        {
          error:
            "Enter your email address or mobile number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      isEmail &&
      !validEmail(email)
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isEmail &&
      !phone
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid email address or mobile number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      password.length <
      8
    ) {
      return NextResponse.json(
        {
          error:
            "Password must contain at least 8 characters.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      createServiceSupabase();

    const createPayload: Record<
      string,
      unknown
    > = {
      password,

      user_metadata: {
        full_name:
          fullName,
      },
    };

    if (email) {
      createPayload.email =
        email;

      createPayload.email_confirm =
        true;
    } else {
      createPayload.phone =
        phone;

      createPayload.phone_confirm =
        true;
    }

    const {
      data,
      error,
    } =
      await supabase.auth.admin.createUser(
        createPayload as any
      );

    if (error) {
      const message =
        String(
          error.message ||
            "Unable to create account."
        );

      const duplicate =
        /already|registered|exists|duplicate/i.test(
          message
        );

      return NextResponse.json(
        {
          error:
            duplicate
              ? "An account already exists with this email or mobile number."
              : message,
        },
        {
          status:
            duplicate
              ? 409
              : 400,
        }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        {
          error:
            "Unable to create account.",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
      }
    );
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : "Unable to create account.",
      },
      {
        status: 500,
      }
    );
  }
}
